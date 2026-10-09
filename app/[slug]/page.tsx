import { connectDB } from "@/lib/db";
import { CmsPage } from "@/models/CmsPage";
import { CmsSetting } from "@/models/CmsSetting";
import { notFound } from "next/navigation";
import { SectionRenderer } from "@/components/page-builder/section-renderer";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const page = await CmsPage.findOne({ slug, status: "published" }).lean();
  if (!page) return {};
  
  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription,
    keywords: page.metaKeywords,
    openGraph: page.ogImage ? { images: [page.ogImage] } : undefined,
  };
}

export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDB();
  
  const page = await CmsPage.findOne({ slug, status: "published" }).lean();
  
  if (!page) {
    notFound();
  }

  // If using visual builder sections
  if (page.sections && page.sections.length > 0) {
    return (
      <main className={`min-h-screen ${page.layout === 'full-width' ? '' : 'max-w-7xl mx-auto'}`}>
        {page.sections.map((section: any) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </main>
    );
  }

  // Fallback for legacy TipTap content
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
