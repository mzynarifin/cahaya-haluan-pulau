export type ImagePreset = {
  aspect: number;
  outputWidth: number;
  ratio: string;
  orientation: "Lanskap" | "Potret";
};

export const imagePresets = {
  heroDesktop: { aspect: 16 / 9, outputWidth: 1920, ratio: "16:9", orientation: "Lanskap" },
  heroMobile: { aspect: 9 / 16, outputWidth: 1080, ratio: "9:16", orientation: "Potret" },
  about: { aspect: 4 / 3, outputWidth: 1200, ratio: "4:3", orientation: "Lanskap" },
  accommodation: { aspect: 4 / 3, outputWidth: 1200, ratio: "4:3", orientation: "Lanskap" },
  facilities: { aspect: 16 / 10, outputWidth: 1200, ratio: "16:10", orientation: "Lanskap" },
  team: { aspect: 4 / 5, outputWidth: 800, ratio: "4:5", orientation: "Potret" },
  gallery: { aspect: 4 / 3, outputWidth: 1600, ratio: "4:3", orientation: "Lanskap" },
  newsCover: { aspect: 16 / 10, outputWidth: 1600, ratio: "16:10", orientation: "Lanskap" },
  newsBody: { aspect: 16 / 10, outputWidth: 1200, ratio: "16:10", orientation: "Lanskap" },
} as const satisfies Record<string, ImagePreset>;
