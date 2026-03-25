import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication Required | 404",
  icons: {
    icon: "/icons/ees.png",
  },
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404 - Not Found</h1>
      <p className="text-lg">Authentication required to access this page.</p>
    </div>
  );
}
