export type WidgetTheme = "light" | "dark" | "minimal";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function resolveTheme(theme: string | null | undefined): WidgetTheme {
  if (theme === "dark" || theme === "minimal") return theme;
  return "dark";
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
