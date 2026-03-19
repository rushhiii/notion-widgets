import type { Metadata } from "next";
import { ProgressWidget } from "@/components/widgets/ProgressWidget";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Progress Bar",
  description: "Embeddable progress bar widget with milestones",
    icons: {
    icon: "/icons/progressbar_icon.png",
    // icon: "/icons/image.png",
  },

};

export default function ProgressPage() {
  return <ProgressWidget />;
}
