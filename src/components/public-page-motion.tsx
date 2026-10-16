"use client";

import { usePathname } from "next/navigation";

export function PublicPageMotion({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return <main id="main"><div key={pathname} className="page-enter">{children}</div></main>;
}
