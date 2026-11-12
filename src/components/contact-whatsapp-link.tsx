"use client";

import { ArrowUpRight } from "lucide-react";
import { useEnglishLanguage } from "@/components/language-runtime";
import { whatsappHref, whatsappMessage } from "@/lib/config";

export function ContactWhatsAppLink({ phone, message, messageEn }: { phone?: string | null; message?: string | null; messageEn?: string | null }) {
  const english = useEnglishLanguage();
  const text = english
    ? messageEn?.trim() || "Hello, I would like to ask about accommodation and admissions."
    : message?.trim() || whatsappMessage;
  const href = whatsappHref(phone, text);
  if (!href) return <div className="notice">{english ? "The official WhatsApp number is not available. Please use another contact method listed on this page." : "Nomor WhatsApp resmi belum tersedia. Silakan gunakan informasi kontak lain yang tercantum di halaman ini."}</div>;
  return <a className="btn contact-whatsapp-cta" href={href} target="_blank" rel="noopener noreferrer">
    {english ? "Contact our team on WhatsApp" : "Hubungi Pengurus via WhatsApp"} <ArrowUpRight size={18} aria-hidden="true" />
  </a>;
}
