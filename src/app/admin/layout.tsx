import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Panel Admin", template: "%s | Panel Admin" },
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
