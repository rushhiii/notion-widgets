import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notion Widgets",
  description: "Static, embeddable Notion widgets built with Next.js",
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
