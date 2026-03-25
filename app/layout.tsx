import type { Metadata } from "next";
import "./globals.css";
import {
  fontManrope,
  fontPlayfair,
  fontPlusJakarta,
  fontLibreBaskerville,
  fontSora,
  fontSpaceGrotesk,
} from "./fonts";
import AuthProvider from "../components/AuthProvider";

export const metadata: Metadata = {
  title: {
    default: "Rushi's Notion Widgets",
    template: "%s | Rn. Widgets",
  },
  description: "Static, embeddable Notion widgets built with Next.js",
  icons: {
    icon: "/icons/ees.png",
  },
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
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
