export type ThemeName =
  | "default"
  | "theme1"
  | "theme2"
  | "theme3"
  | "theme4"
  | "theme5"
  | "theme6"
  | "theme7"
  | "theme8";

export const THEMES: Record<ThemeName, { background: string; holder: string; text: string }> = {
  default: { background: "#000", holder: "#101010", text: "#b7b7b7" },
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
  "theme1",
  "theme2",
  "theme3",
  "theme4",
  "theme5",
  "theme6",
  "theme7",
  "theme8",
];
