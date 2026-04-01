import {
  Libre_Baskerville,
  Manrope,
  Plus_Jakarta_Sans,
  Playfair_Display,
  Sora,
  Space_Grotesk,
} from "next/font/google";

export const fontSpaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal"],
  display: "swap",
  variable: "--font-space-grotesk",
});

export const fontSora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal"],
  display: "swap",
  variable: "--font-sora",
});

export const fontPlusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

export const fontManrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal"],
  display: "swap",
  variable: "--font-manrope",
});

export const fontPlayfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-playfair",
});

export const fontLibreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-libre-baskerville",
});
