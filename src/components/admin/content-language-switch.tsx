"use client";

import styles from "./content-language-switch.module.css";

export function ContentLanguageSwitch({ value, onChange }: {
  value: "id" | "en";
  onChange: (value: "id" | "en") => void;
}) {
  return <div className={styles.switch}>
    <span className={styles.label}>Bahasa konten</span>
    <div className={styles.options} role="group" aria-label="Bahasa konten">
      <button type="button" className={`${styles.button} ${value === "id" ? styles.active : ""}`} aria-pressed={value === "id"} onClick={() => onChange("id")}>
        Bahasa Indonesia
      </button>
      <button type="button" className={`${styles.button} ${value === "en" ? styles.active : ""}`} aria-pressed={value === "en"} onClick={() => onChange("en")}>
        English
      </button>
    </div>
  </div>;
}
