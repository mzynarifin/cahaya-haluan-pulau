"use client";

import { useEffect, useState } from "react";

export function LanguageToggle() {
  const [english, setEnglish] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("chp-language") === "en";
    setEnglish(saved);
    document.documentElement.lang = saved ? "en" : "id";
    document.documentElement.dataset.language = saved ? "en" : "id";
  }, []);
  function toggle() {
    const next = !english;
    setEnglish(next);
    localStorage.setItem("chp-language", next ? "en" : "id");
    document.documentElement.lang = next ? "en" : "id";
    document.documentElement.dataset.language = next ? "en" : "id";
    window.dispatchEvent(new CustomEvent("chp-language-change", { detail: next ? "en" : "id" }));
  }
  return <button type="button" className="language-toggle" onClick={toggle} aria-label={english ? "Switch to Indonesian" : "Switch to English"}>{english ? "ID" : "EN"}</button>;
}
