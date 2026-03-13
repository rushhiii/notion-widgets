import type { Metadata } from "next";
import DdayWidget from "@/components/widgets/DdayWidget";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Days Since",
  description: "Embeddable Countdown/elapsed badges with days, weeks, months and much more",
  icons: {
    // icon: "/icons/countdown_icon.png",
    icon: "/icons/countdown_style.png",
    // icon: "/icons/countdown.png",
  },
};

export default function DdayPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-transparent">
      <DdayWidget />
    </main>
  );
}
