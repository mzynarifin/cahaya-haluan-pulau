export type ImagePreset = {
  aspect: number;
  outputWidth: number;
  ratio: "16:9" | "9:16" | "4:3" | "16:10" | "4:5";
};

export const cropShapes = {
  landscape: 16 / 9,
  portrait: 9 / 16,
  "four-three": 4 / 3,
  "sixteen-ten": 16 / 10,
  "four-five": 4 / 5,
} as const;

export type CropShape = keyof typeof cropShapes;
export type CroppedImage = { file: File; shape: CropShape };

const shapeByRatio: Record<ImagePreset["ratio"], CropShape> = {
  "16:9": "landscape",
  "9:16": "portrait",
  "4:3": "four-three",
  "16:10": "sixteen-ten",
  "4:5": "four-five",
};

export function cropShapeForPreset(preset: ImagePreset): CropShape {
  return shapeByRatio[preset.ratio];
}

export function imageAspectFromUrl(url: string | null | undefined, fallback: number): number {
  const shape = url?.match(/\/(landscape|portrait|four-three|sixteen-ten|four-five)\/[a-f0-9-]{36}\.(?:jpe?g|png|webp)(?:[?#]|$)/)?.[1] as CropShape | undefined;
  return shape ? cropShapes[shape] : fallback;
}

export const imagePresets = {
  heroDesktop: { aspect: 16 / 9, outputWidth: 1920, ratio: "16:9" },
  heroMobile: { aspect: 9 / 16, outputWidth: 1080, ratio: "9:16" },
  about: { aspect: 4 / 3, outputWidth: 1200, ratio: "4:3" },
  accommodation: { aspect: 4 / 3, outputWidth: 1200, ratio: "4:3" },
  facilities: { aspect: 16 / 10, outputWidth: 1200, ratio: "16:10" },
  team: { aspect: 4 / 5, outputWidth: 800, ratio: "4:5" },
  newsCover: { aspect: 16 / 10, outputWidth: 1600, ratio: "16:10" },
  newsBody: { aspect: 16 / 10, outputWidth: 1200, ratio: "16:10" },
} as const satisfies Record<string, ImagePreset>;
