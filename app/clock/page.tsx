import type { Metadata } from "next";
import { ClockWidget } from "@/components/widgets/ClockWidget";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "FlipClock",
  description: "Embeddable clock widget with timezone and format controls",
  icons: {
    // icon: "/icons/clock.png",
    icon: "/icons/flipclock_icon.png",
  },
};

export default function ClockPage() {
  return <ClockWidget />;
}
