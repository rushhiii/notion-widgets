export type WidgetTheme = "light" | "dark" | "minimal";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function resolveTheme(theme: string | null | undefined): WidgetTheme {
  if (theme === "dark" || theme === "minimal") return theme;
  return "dark";
}

export function parseColorParam(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  const prefixed = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  const hexPattern = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  return hexPattern.test(prefixed) ? prefixed : null;
}

export function parseBooleanParam(value: string | null, defaultValue = false): boolean {
  if (!value) return defaultValue;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return defaultValue;
}

export function parsePositiveIntParam(value: string | null, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return defaultValue;
  return parsed;
}
