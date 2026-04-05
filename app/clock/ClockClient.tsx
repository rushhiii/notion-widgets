"use client";

import { useSearchParams } from "next/navigation";
import ClockWidget from "@/components/widgets/ClockWidget";
import ClockBuilder from "./Builder";

export function ClockClient() {
  const searchParams = useSearchParams();
  const embed = searchParams.get("embed") === "1";

  if (embed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-transparent">
        <ClockWidget />
      </main>
    );
  }

  return <ClockBuilder />;
}

export default ClockClient;
