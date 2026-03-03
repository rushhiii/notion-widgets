import { cn, resolveTheme } from "@/lib/utils";

type WidgetContainerProps = {
  children: React.ReactNode;
  theme?: string | null;
  className?: string;
  contentClassName?: string;
  heightClassName?: string;
};

export function WidgetContainer({
  children,
  theme,
  className,
  contentClassName,
  heightClassName = "h-[360px]",
}: WidgetContainerProps) {
  const resolvedTheme = resolveTheme(theme);

  const themeClasses = {
    light: "border-transparent bg-transparent text-zinc-900",
    // dark: "border-transparent bg-zinc-900/75 text-zinc-100",
    dark: "border-transparent bg-transparent text-zinc-100",
    minimal: "border-transparent bg-transparent text-zinc-900",
  } as const;

  return (
    <main
      className={cn(
        "flex h-screen w-full items-center justify-center overflow-hidden bg-transparent px-4",
        className,
      )}
    >
      <section
        className={cn(
          "flex w-full max-w-xl items-center justify-center rounded-2xl border p-6 text-center shadow-none",
          heightClassName,
          themeClasses[resolvedTheme],
          contentClassName,
        )}
      >
        {children}
      </section>
    </main>
  );
}
