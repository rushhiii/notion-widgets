import { useEffect, useState } from "react";

export type ThemeName =
  | "default"
  | "light"
  | "purple"
  | "teal"
  | "sunset"
  // | "transparent"
  | "theme1"
  | "theme2"
  | "theme3"
  | "theme4"
  | "theme5"
  | "theme6"
  | "theme7"
  | "theme8";
// #2596be notion light bg
export const THEMES: Record<ThemeName, { background: string; holder: string; text: string }> = {
  default: { background: "#000", holder: "#101010", text: "#B7B7B7" },
  light: { background: "#f3f3f3", holder: "#e6e6e6", text: "#000000" },
  purple: { background: "#0f0a1f", holder: "#17112b", text: "#d8c7ff" },
  teal: { background: "#0c1a1a", holder: "#132222", text: "#c0fff5" },
  sunset: { background: "#1a0f0c", holder: "#241512", text: "#ffc7a3" },
  // transparent: { background: "#191919", holder: "#101010", text: "#e5e7eb" },
  theme1: { background: "#0F140F", holder: "#1A1F1A", text: "#C4EBC1" },
  theme2: { background: "#131315", holder: "#1B1C20", text: "#C5C8F8" },
  theme3: { background: "#1B1616", holder: "#271E1E", text: "#EF6666" },
  theme4: { background: "#16120B", holder: "#221E17", text: "#FFAC45" },
  theme5: { background: "#131519", holder: "#1A1E23", text: "#CCE1FF" },
  theme6: { background: "#0D0F11", holder: "#14161A", text: "#FFD458" },
  theme7: { background: "#1A171C", holder: "#221D23", text: "#E3CEEC" },
  theme8: { background: "#181B19", holder: "#1E2320", text: "#BEEBD2" },
};

export const THEME_ORDER: ThemeName[] = [
  "default",
  "light",
  "purple",
  "teal",
  "sunset",
  // "transparent",
  "theme1",
  "theme2",
  "theme3",
  "theme4",
  "theme5",
  "theme6",
  "theme7",
  "theme8",
];

// export function resolveThemeVars(theme: ThemeName): { background: string; holder: string; text: string } {
//   const base = THEMES[theme];
//   if (!base) return THEMES.default;

//   if (theme === "transparent") {
//     const isDark = detectNotionDark();
//     if (isDark) {
//       return { background: "#191919", holder: "#101010", text: "#e5e7eb" };
//     }
//     return { background: "#f6f6f7", holder: "#ffffff", text: "#111214" };
//   }

//   return base;
// }

function getThemeModeFromLocalStorage(): "dark" | "light" | null {
  try {
    const raw = window.localStorage?.getItem("theme");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.mode === "dark" || parsed?.mode === "light") return parsed.mode;
  } catch {
    /* ignore */
  }
  return null;
}

function getThemeModeFromScript(): "dark" | "light" | null {
  try {
    const el = document.getElementById("theme-data");
    if (!el?.textContent) return null;
    const parsed = JSON.parse(el.textContent);
    if (parsed?.mode && parsed.mode !== "<<DEFAULT_THEME>>") {
      if (parsed.mode === "dark" || parsed.mode === "light") return parsed.mode;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function detectByComputedBg(): boolean | null {
  const el = document.documentElement || document.body;
  if (!el) return null;
  const bg = getComputedStyle(el).backgroundColor;
  const parts = bg.match(/\d+/g)?.map(Number) ?? [];
  if (parts.length < 3) return null;
  const [r, g, b] = parts;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance < 140;
}

export function detectNotionDark(): boolean {
  if (typeof window === "undefined") return false;
  const root = document.documentElement;
  const body = document.body;

  if (body?.classList.contains("notion-dark-theme") || body?.classList.contains("dark")) return true;
  if (body?.classList.contains("notion-light-theme")) return false;
  if (root?.classList.contains("notion-dark-theme")) return true;
  if (root?.classList.contains("notion-light-theme")) return false;

  const lsMode = getThemeModeFromLocalStorage();
  if (lsMode === "dark") return true;
  if (lsMode === "light") return false;

  const scriptMode = getThemeModeFromScript();
  if (scriptMode === "dark") return true;
  if (scriptMode === "light") return false;

  if (root?.dataset?.theme === "dark" || body?.dataset?.theme === "dark") return true;
  if (root?.dataset?.theme === "light" || body?.dataset?.theme === "light") return false;

  const inferred = detectByComputedBg();
  if (inferred !== null) return inferred;

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function useNotionTheme(): boolean {
  const [isDark, setIsDark] = useState(detectNotionDark);

  useEffect(() => {
    const onChange = () => setIsDark(detectNotionDark());

    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    mql?.addEventListener("change", onChange);

    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    if (document.body) {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["class", "data-theme"],
      });
    }

    return () => {
      mql?.removeEventListener("change", onChange);
      observer.disconnect();
    };
  }, []);

  return isDark;
}
