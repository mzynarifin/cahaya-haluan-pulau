import type { Metadata } from "next";
import { ProgramPage } from "@/components/program-page";
import { getProgramCopy } from "@/lib/program-content";
import { getSection } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSection("program-suara-anak-pulau");
  const copy = getProgramCopy("cahaya-anak-pulau", content, "id");
  return { title: copy.title, description: copy.description };
}

export default async function Page() {
  const content = await getSection("program-suara-anak-pulau");
  return <ProgramPage slug="cahaya-anak-pulau" content={content} />;
}
