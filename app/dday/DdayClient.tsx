"use client";

import { useSearchParams } from "next/navigation";
import DdayWidget from "@/components/widgets/DdayWidget";
import DdayBuilder from "./Builder";

export function DdayClient() {
  const searchParams = useSearchParams();
  const embed = searchParams.get("embed") === "1";

  if (embed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-transparent">
        <DdayWidget />
      </main>
    );
  }

  return <DdayBuilder />;
}
