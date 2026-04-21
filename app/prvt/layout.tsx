import type { Metadata } from "next";
import "../globals.css";
import {
  fontManrope,
  fontPlayfair,
  fontPlusJakarta,
  fontLibreBaskerville,
  fontSora,
  fontSpaceGrotesk,
} from "../fonts";
import AuthProvider from "../../components/AuthProvider";

export const metadata: Metadata = {
  title: {
    default: "Private Page",
    template: "%s | Rn. Widgets",
  },
  description: "Private dashboard for Notion Widgets",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  icons: {
    icon: "/icons/r_icon.png",
  },
};

export default function PrvtLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`h-full bg-transparent ${fontSpaceGrotesk.variable} ${fontSora.variable} ${fontPlusJakarta.variable} ${fontManrope.variable} ${fontPlayfair.variable} ${fontLibreBaskerville.variable}`}
    >
      <body className="h-full bg-transparent antialiased" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}