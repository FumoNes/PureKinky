const invisibleCharacters = /[\u200B-\u200D\u2060\uFEFF]/g;

export function normalizeEmail(value: string) {
  return value
    .normalize("NFKC")
    .replace(invisibleCharacters, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

