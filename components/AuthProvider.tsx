"use client";
import { SessionProvider } from "next-auth/react";
import { useEffect, useState } from "react";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isBot, setIsBot] = useState(false);

  useEffect(() => {
    // Detect crawlers/bots from User-Agent
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const botPattern = /bot|crawler|spider|vercel|headless|puppeteer|playwright/i;
    setIsBot(botPattern.test(userAgent));
  }, []);

  // Skip SessionProvider for bots to allow preview/screenshot generation
  if (isBot) {
    return <>{children}</>;
  }

  return <SessionProvider>{children}</SessionProvider>;
}
