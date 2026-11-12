import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNewsBySlug } from "@/lib/data";
import { siteName, siteUrl } from "@/lib/config";
import { ArticleBody } from "@/components/article-body";
import { imageAspectFromUrl } from "@/lib/image-presets";
import { LocalizedText } from "@/components/language-runtime";
import { LocalizedDate } from "@/components/localized-date";
import { NewsCoverImage } from "@/components/news-cover-image";

const defaultSocialImage = "/opengraph-image";

function summaryFromBody(body: string) {
  return body
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_`~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);
  if (!news) return { title: "Berita tidak ditemukan", robots: { index: false, follow: false } };

  const description = (news.excerpt?.trim() || summaryFromBody(news.body) || `Berita terbaru dari ${siteName}.`).slice(0, 160);
  const canonical = `/berita/${news.slug}`;
  const image = news.cover_url || defaultSocialImage;
  return {
    title: news.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: news.title,
      description,
      url: canonical,
      siteName,
      locale: "id_ID",
      publishedTime: news.published_at || undefined,
      images: [{ url: image, alt: news.cover_alt || news.title }],
    },
    twitter: { card: "summary_large_image", title: news.title, description, images: [image] },
  };
}

export default async function NewsDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);
  if (!news) notFound();

  const canonical = `${siteUrl}/berita/${news.slug}`;
  const description = (news.excerpt?.trim() || summaryFromBody(news.body) || `Berita terbaru dari ${siteName}.`).slice(0, 160);
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: news.title,
      description,
      image: [news.cover_url || `${siteUrl}${defaultSocialImage}`],
      datePublished: news.published_at || undefined,
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
      author: { "@type": "Organization", "@id": `${siteUrl}/#organization`, name: siteName },
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: "id-ID",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Berita", item: `${siteUrl}/berita` },
        { "@type": "ListItem", position: 3, name: news.title, item: canonical },
      ],
    },
  ];

  return <article className="section">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <div className="container article">
      <Link href="/berita" className="link-arrow">← Kembali ke berita</Link>
      <header style={{ margin: "32px 0" }}>
        <span className="eyebrow"><LocalizedDate value={news.published_at} /></span>
        <h1 style={{ margin: "12px 0" }}><LocalizedText as="span" id={news.title} en={news.title_en} /></h1>
        {news.excerpt && <p className="lead"><LocalizedText id={news.excerpt} en={news.excerpt_en} /></p>}
      </header>
      {news.cover_url && <figure style={{ margin: "0 0 34px" }}>
        <NewsCoverImage
          src={news.cover_url}
          alt={news.cover_alt || ""}
          altEn={news.cover_alt_en}
          width={1200}
          height={Math.round(1200 / imageAspectFromUrl(news.cover_url, 16 / 10))}
          sizes="(max-width: 890px) calc(100vw - 40px), 850px"
          style={{ borderRadius: 12, width: "100%", maxHeight: 700, objectFit: "contain" }}
        />
      </figure>}
      <ArticleBody body={news.body} bodyEn={news.body_en} />
    </div>
  </article>;
}
