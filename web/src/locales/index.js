import zh from "./zh";
import ko from "./ko";
import en from "./en";

export const messages = { zh, ko, en };
export const localeOptions = ["zh", "ko", "en"];

export function normalizeLocale(locale) {
  if (!locale) return "zh";
  const lower = locale.toLowerCase();
  if (lower.startsWith("ko")) return "ko";
  if (lower.startsWith("en")) return "en";
  if (lower.startsWith("zh")) return "zh";
  return "zh";
}
