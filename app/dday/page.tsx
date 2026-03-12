import DdayWidget from "@/components/widgets/DdayWidget";

export const dynamic = "force-static";

export default function DdayPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-transparent">
      <DdayWidget />
    </main>
  );
}
