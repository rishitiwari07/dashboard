import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Proposal } from "@/models/Proposal";
import { CompanyProfile } from "@/models/CompanyProfile";
import { Client } from "@/models/Client";
import { verifyToken } from "@/lib/auth";
import ProposalPrintPage from "./proposal-print-page";

// Ensure Client model is registered
void Client;

const COOKIE_NAME = "kalp_auth_token";

export default async function ProposalPrintRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) redirect("/login");

  let user: any;
  try {
    user = verifyToken(token);
  } catch {
    redirect("/login");
  }

  const { id } = await params;
  await connectDB();

  const proposal = await Proposal.findById(id)
    .populate("client", "name companyName companyAddress email phone gstin")
    .populate("owner", "name email")
    .lean();

  if (!proposal) redirect("/dashboard/finance/proposals");

  const companyProfile = await CompanyProfile.findOne({
    owner: user.userId,
  }).lean();

  return (
    <ProposalPrintPage
      proposal={JSON.parse(JSON.stringify({ ...(proposal as any), id: String((proposal as any)._id) }))}
      companyProfile={JSON.parse(JSON.stringify(companyProfile))}
    />
  );
}
