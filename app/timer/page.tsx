import type { Metadata } from "next";
import { TimerWidget } from "@/components/widgets/TimerWidget";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "FlipClock Timer",
  description: "Embeddable flip timer widget with themes and fullscreen",
  icons: {
    icon: "/icons/clock.png",
  },
};

export default function TimerPage() {
  return <TimerWidget />;
}
