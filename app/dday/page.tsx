import type { Metadata } from "next";
import { DdayClient } from "./DdayClient";

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
  return <DdayClient />;
}
