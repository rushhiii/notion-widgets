import type { Metadata } from "next";
import { StopwatchWidget } from "@/components/widgets/StopwatchWidget";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "FlipClock Stopwatch",
  description: "Embeddable flip stopwatch widget with themes and fullscreen",
  icons: {
    // icon: "/icons/clock.png",
    icon: "/icons/stopwatch_icon.png",
  },
};

export default function StopwatchPage() {
  return <StopwatchWidget />;
}
