function luminance(hex) {
  const channels = hex.replace("#", "").match(/.{2}/g).map(value => parseInt(value, 16) / 255);
  const linear = channels.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function ratio(first, second) {
  const firstLum = luminance(first);
  const secondLum = luminance(second);
  return (Math.max(firstLum, secondLum) + 0.05) / (Math.min(firstLum, secondLum) + 0.05);
}

const pairs = [
  ["Texto blanco sobre negro", "#ffffff", "#0d0d0d"],
  ["Rosa de señal sobre negro", "#ff3fa4", "#0d0d0d"],
  ["Texto negro sobre CTA rosa", "#0d0d0d", "#ff3fa4"],
];

for (const [label, foreground, background] of pairs) {
  console.log(`${label}: ${ratio(foreground, background).toFixed(2)}:1`);
}
