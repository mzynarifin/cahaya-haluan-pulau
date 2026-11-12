import type { Metadata } from "next";
import { ProgramPage } from "@/components/program-page";
import { getProgramCopy } from "@/lib/program-content";
import { getSection } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSection("program-urx1");
  const copy = getProgramCopy("urx1", content, "id");
  return { title: copy.title, description: copy.description };
}

export default async function Page() {
  const content = await getSection("program-urx1");
  return <ProgramPage slug="urx1" content={content} />;
}
