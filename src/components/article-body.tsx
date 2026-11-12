"use client";

import { useEnglishLanguage } from "@/components/language-runtime";

function inline(text: string) {
  const pieces = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g);
  return pieces.map((piece, index) => {
    if (piece.startsWith("**") && piece.endsWith("**")) return <strong key={index}>{piece.slice(2, -2)}</strong>;
    if (piece.startsWith("*") && piece.endsWith("*")) return <em key={index}>{piece.slice(1, -1)}</em>;
    const link = piece.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) return <a key={index} href={link[2]} target="_blank" rel="noopener noreferrer" className="link-arrow">{link[1]}</a>;
    return piece;
  });
}

export function ArticleBody({ body, bodyEn }: { body: string; bodyEn?: string | null }) {
  const english = useEnglishLanguage();
  const lines = (english ? bodyEn?.trim() || body : body).split("\n");
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  function flush() {
    if (!list.length) return;
    blocks.push(<ul key={`list-${blocks.length}`}>{list.map((item, index) => <li key={index}>{inline(item)}</li>)}</ul>);
    list = [];
  }
  lines.forEach((line, index) => {
    const value = line.trim();
    if (value.startsWith("- ")) { list.push(value.slice(2)); return; }
    flush();
    const media = value.match(/^!\[([^\]]{1,200})\]\((https:\/\/[^\s)]+)(?:\s+"([^"]*)")?\)$/);
    if (media) {
      blocks.push(<figure key={index}><img src={media[2]} alt={media[1]} width={1200} height={750} loading="lazy" decoding="async" style={{ width: "100%", height: "auto", borderRadius: 10 }} />{media[3] && <figcaption className="tiny muted">{media[3]}</figcaption>}</figure>);
      return;
    }
    if (value.startsWith("## ")) blocks.push(<h2 key={index}>{inline(value.slice(3))}</h2>);
    else if (value.startsWith("### ")) blocks.push(<h3 key={index}>{inline(value.slice(4))}</h3>);
    else if (value) blocks.push(<p key={index}>{inline(value)}</p>);
  });
  flush();
  return <div className="article-body">{blocks}</div>;
}
