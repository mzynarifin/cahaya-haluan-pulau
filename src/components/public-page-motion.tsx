"use client";

export function PublicPageMotion({ children }: { children: React.ReactNode }) {
  return <main id="main"><div className="page-enter">{children}</div></main>;
}
