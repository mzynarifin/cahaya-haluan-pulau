import type { Metadata } from "next";
import { ProgramPage } from "@/components/program-page";
export const metadata: Metadata = { title: "URX1", description: "Inisiatif kolaboratif Cahaya Haluan Pulau." };
export default function Page() { return <ProgramPage slug="urx1" />; }
