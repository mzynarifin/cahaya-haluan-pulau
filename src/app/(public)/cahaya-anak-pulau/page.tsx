import type { Metadata } from "next";
import { ProgramPage } from "@/components/program-page";
export const metadata: Metadata = { title: "Cahaya Anak Pulau", description: "Program pendidikan dan pendampingan Cahaya Haluan Pulau." };
export default function Page() { return <ProgramPage slug="cahaya-anak-pulau" />; }
