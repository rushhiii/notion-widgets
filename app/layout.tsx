import type { Metadata } from "next";
import "./globals.css";
import {
  fontKarla,
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
      className={`h-full bg-transparent ${fontSpaceGrotesk.variable} ${fontSora.variable} ${fontPlusJakarta.variable} ${fontManrope.variable} ${fontPlayfair.variable} ${fontLibreBaskerville.variable} ${fontKarla.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Karla:wght@400;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
      </head>
      <body className="h-full bg-transparent antialiased" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
