const brandNames = [
  ["Cahaya Haluan Pulau", "\uE0000\uE001"],
  ["Suara Anak Pulau", "\uE0001\uE001"],
  ["URX1", "\uE0002\uE001"],
] as const;

const brandNameTokens = new Map(brandNames.map(([name, token]) => [name.toLocaleLowerCase(), token]));

export function preserveBrandNames(value: string) {
  return value
    .replace(/Voice of Island Children|Island Children's Voice/giu, "Suara Anak Pulau")
    .replace(/Island Children email/giu, "Email for Suara Anak Pulau")
    .replace(/Cahaya Haluan Pulau/giu, "Cahaya Haluan Pulau")
    .replace(/Suara Anak Pulau/giu, "Suara Anak Pulau")
    .replace(/URX1/giu, "URX1");
}

export function maskBrandNames(value: string) {
  return preserveBrandNames(value).replace(
    /(^|[^\p{L}\p{N}])(Cahaya Haluan Pulau|Suara Anak Pulau|URX1)(?=$|[^\p{L}\p{N}])/giu,
    (_match, prefix: string, name: string) => `${prefix}${brandNameTokens.get(name.toLocaleLowerCase()) || name}`,
  );
}

export function restoreBrandNames(value: string) {
  return value.replace(/\uE000([0-2])\uE001/g, (_match, index: string) => brandNames[Number(index)][0]);
}
