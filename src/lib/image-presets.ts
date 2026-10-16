export type ImagePreset = {
  aspect: number;
  outputWidth: number;
  ratio: string;
  orientation: "Lanskap" | "Potret";
};

export type CropShape = "landscape" | "portrait" | "four-five";
export type CroppedImage = { file: File; shape: CropShape };

export const cropShapes = {
  landscape: { label: "Lanskap", ratio: "16:9", aspect: 16 / 9, orientation: "Lanskap", maxWidth: 1920, folder: "landscape" },
  portrait: { label: "Potret", ratio: "9:16", aspect: 9 / 16, orientation: "Potret", maxWidth: 1080, folder: "portrait" },
  "four-five": { label: "Potret", ratio: "4:5", aspect: 4 / 5, orientation: "Potret", maxWidth: 1200, folder: "four-five" },
} as const;

export function defaultCropShape(preset: ImagePreset): CropShape {
  return preset.ratio === "9:16" ? "portrait" : preset.ratio === "4:5" ? "four-five" : "landscape";
}

export function imageAspectFromUrl(url: string | null | undefined, fallback: number): number {
  const shape = url?.match(/\/(landscape|portrait|four-five)\/[a-f0-9-]{36}\.(?:jpe?g|png|webp)(?:[?#]|$)/)?.[1] as CropShape | undefined;
  return shape ? cropShapes[shape].aspect : fallback;
}

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
