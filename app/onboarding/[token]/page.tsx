import { connectDB } from "@/lib/db";
import { ClientOnboardingLink } from "@/models/ClientOnboardingLink";
import { notFound } from "next/navigation";
import { OnboardingFormClient } from "@/components/onboarding-form-client";

export const metadata = {
  title: "Client Onboarding",
  description: "Welcome to WebWrite Services! Please provide your details.",
};

export default async function ClientOnboardingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  
  await connectDB();
  const link = await ClientOnboardingLink.findOne({ token, isActive: true }).lean();
  
  if (!link) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans antialiased selection:bg-black/10">
      <OnboardingFormClient token={token} />
    </div>
  );
}
