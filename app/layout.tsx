import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Rushi's Notion Widgets",
    template: "%s | Rn. Widgets",
  },
  description: "Static, embeddable Notion widgets built with Next.js",
  icons: {
    // icon: "/icons/es.png",
    icon: "/icons/ees.png",
  },
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="h-full bg-transparent">
      <body className="h-full bg-transparent antialiased">
        {children}
      </body>
    </html>
  );
}
