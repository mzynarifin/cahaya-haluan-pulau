import { preserveBrandNames } from "@/lib/brand-names";

export type ProgramSlug = "cahaya-anak-pulau" | "urx1";
export type ProgramLanguage = "id" | "en";

type ProgramTextKey =
  | "eyebrow"
  | "kicker"
  | "title"
  | "subtitle"
  | "description"
  | "heroButton"
  | "focusEyebrow"
  | "focusTitle"
  | "focusDescription"
  | "focus1"
  | "focus2"
  | "focus3"
  | "ctaEyebrow"
  | "ctaTitle"
  | "ctaButton";

type ProgramText = Record<ProgramTextKey, string>;

export type ProgramCopy = ProgramText & { focusItems: [string, string, string] };

export const programDefaults: Record<ProgramSlug, Record<ProgramLanguage, ProgramText>> = {
  "cahaya-anak-pulau": {
    id: {
      eyebrow: "Program / Pendidikan",
      kicker: "Cahaya Haluan Pulau",
      title: "Suara Anak Pulau",
      subtitle: "Membuka rumah bagi putra-putri daerah.",
      description: "Membuka rumah bagi putra-putri daerah untuk mendapatkan pendidikan, pelatihan, dan pengalaman hidup yang lebih luas di luar pulau mereka.",
      heroButton: "Hubungi kami",
      focusEyebrow: "FOKUS KAMI",
      focusTitle: "Ruang untuk belajar dan bertumbuh",
      focusDescription: "Rumah yang mendukung anak muda untuk belajar, berlatih, dan menemukan berbagai kemungkinan baru.",
      focus1: "Pendidikan",
      focus2: "Pelatihan",
      focus3: "Pengalaman hidup yang lebih luas",
      ctaEyebrow: "JADI BAGIAN DARI PERJALANAN",
      ctaTitle: "Mari wujudkan masa depan yang lebih baik bersama.",
      ctaButton: "Hubungi pengurus",
    },
    en: {
      eyebrow: "PROGRAM / EDUCATION",
      kicker: "Cahaya Haluan Pulau",
      title: "Suara Anak Pulau",
      subtitle: "Opening our home to young people from the islands.",
      description: "Opening our home to young people from their local communities, giving them access to education, training, and broader life experiences beyond their islands.",
      heroButton: "Get in touch",
      focusEyebrow: "OUR FOCUS",
      focusTitle: "Room to learn and grow",
      focusDescription: "A welcoming home where young people can learn, train, and discover new possibilities.",
      focus1: "Education",
      focus2: "Training",
      focus3: "Broader life experiences",
      ctaEyebrow: "BE PART OF THE JOURNEY",
      ctaTitle: "Let us create a brighter future together.",
      ctaButton: "Contact our team",
    },
  },
  urx1: {
    id: {
      eyebrow: "Inisiatif / Kemanusiaan",
      kicker: "Cahaya Haluan Pulau",
      title: "URX1",
      subtitle: "Menjangkau pulau dan komunitas di seluruh Indonesia.",
      description: "Kunjungan rutin ke berbagai daerah dan pedalaman ke pulau-pulau di Indonesia dengan program kemanusiaan dan literasi, serta berbagai program kunjungan, pelatihan, dan kemanusiaan bagi kaum marginal.",
      heroButton: "Hubungi kami",
      focusEyebrow: "FOKUS KAMI",
      focusTitle: "Hadir bersama komunitas",
      focusDescription: "Kami membangun hubungan bermakna melalui kunjungan, pembelajaran, dan aksi kemanusiaan.",
      focus1: "Kunjungan rutin ke daerah dan pedalaman",
      focus2: "Program kemanusiaan dan literasi",
      focus3: "Kunjungan, pelatihan, dan dukungan bagi kaum marginal",
      ctaEyebrow: "JADI BAGIAN DARI PERJALANAN",
      ctaTitle: "Mari wujudkan masa depan yang lebih baik bersama.",
      ctaButton: "Hubungi pengurus",
    },
    en: {
      eyebrow: "INITIATIVE / HUMANITARIAN",
      kicker: "Cahaya Haluan Pulau",
      title: "URX1",
      subtitle: "Reaching islands and communities across Indonesia.",
      description: "Regular visits to regions and remote island communities across Indonesia through humanitarian and literacy programs, alongside visits, training, and humanitarian support for marginalized communities.",
      heroButton: "Get in touch",
      focusEyebrow: "OUR FOCUS",
      focusTitle: "Connecting with communities",
      focusDescription: "We build lasting connections through visits, learning, and humanitarian action.",
      focus1: "Regular regional and remote island visits",
      focus2: "Humanitarian and literacy programs",
      focus3: "Training and support for marginalized communities",
      ctaEyebrow: "BE PART OF THE JOURNEY",
      ctaTitle: "Let us create a brighter future together.",
      ctaButton: "Contact our team",
    },
  },
};

export function getProgramCopy(
  slug: ProgramSlug,
  content: Record<string, unknown>,
  language: ProgramLanguage,
): ProgramCopy {
  const defaults = programDefaults[slug][language];
  const read = (key: ProgramTextKey) => {
    const value = content[`${key}${language === "en" ? "En" : ""}`];
    return preserveBrandNames(typeof value === "string" && value.trim() ? value : defaults[key]);
  };

  return {
    eyebrow: read("eyebrow"),
    kicker: read("kicker"),
    title: read("title"),
    subtitle: read("subtitle"),
    description: read("description"),
    heroButton: read("heroButton"),
    focusEyebrow: read("focusEyebrow"),
    focusTitle: read("focusTitle"),
    focusDescription: read("focusDescription"),
    focus1: read("focus1"),
    focus2: read("focus2"),
    focus3: read("focus3"),
    ctaEyebrow: read("ctaEyebrow"),
    ctaTitle: read("ctaTitle"),
    ctaButton: read("ctaButton"),
    focusItems: [read("focus1"), read("focus2"), read("focus3")],
  };
}
