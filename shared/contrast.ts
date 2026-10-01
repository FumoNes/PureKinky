function relativeLuminance(hex: string): number {
  const channels = hex.replace("#", "").match(/.{2}/g)?.map(value => parseInt(value, 16) / 255);
  if (!channels || channels.length !== 3) throw new Error("El color debe expresarse como hexadecimal RGB.");
  const linear = channels.map(value => value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

export function contrastRatio(foreground: string, background: string): number {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

