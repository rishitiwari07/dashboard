import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Invoice } from "@/models/Invoice";
import { CompanyProfile } from "@/models/CompanyProfile";
import { verifyToken } from "@/lib/auth";
import InvoicePrintPage from "./invoice-print-page";

const COOKIE_NAME = "kalp_auth_token";

export default async function InvoiceViewPage({
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

  const invoice = await Invoice.findOne({ _id: id, owner: user.userId })
    .populate("client")
    .populate("project", "name description")
    .lean();

  if (!invoice) redirect("/dashboard/invoices");

  const companyProfile = await CompanyProfile.findOne({
    owner: user.userId,
  }).lean();

  return (
    <InvoicePrintPage
      invoice={JSON.parse(JSON.stringify({ ...invoice, id: String((invoice as any)._id) }))}
      companyProfile={JSON.parse(JSON.stringify(companyProfile))}
    />
  );
}
