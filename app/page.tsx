import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { CmsPage } from "@/models/CmsPage";
import { SectionRenderer } from "@/components/page-builder/section-renderer";
export const dynamic = "force-dynamic";

export default async function HomePage() {
  await connectDB();
  
  // Try to find a published page with slug 'home'
  const page = await CmsPage.findOne({ slug: "home", status: "published" }).lean();
  
  if (page) {
    if (page.sections && page.sections.length > 0) {
      return (
        <main className={`min-h-screen ${page.layout === 'full-width' ? '' : 'max-w-7xl mx-auto'}`}>
          {page.sections.map((section: any) => (
            <SectionRenderer key={section.id} section={section} />
          ))}
        </main>
      );
    }
    
    return (
      <main className={`min-h-screen py-16 px-6 ${page.layout === 'full-width' ? '' : 'max-w-4xl mx-auto'}`}>
        <h1 className="text-4xl md:text-5xl font-bold mb-8">{page.title}</h1>
        <div 
          className="prose prose-zinc max-w-none prose-headings:font-semibold prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: page.content || "" }}
        />
      </main>
    );
  }

  // Fallback if no home page is published
  const cookieStore = await cookies();
  const token = cookieStore.get("kalp_auth_token")?.value;

  if (token) {
    try {
      verifyToken(token);
      redirect("/dashboard");
    } catch {
      // Invalid or expired token
    }
  }

  redirect("/login");
}
