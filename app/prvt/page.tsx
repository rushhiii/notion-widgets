"use client";
import type { Metadata } from "next";
import { useEffect } from "react";

export const metadata: Metadata = {
  title: "Private Page | Rn. Widgets",
  icons: {
    icon: "/icons/ees.png",
  },
};

export default function PrvtPage() {
  useEffect(() => {
    // Always send Authorization header if present in sessionStorage
    const auth = sessionStorage.getItem("prvtAuth");
    if (auth) {
      fetch("/prvt", {
        headers: { Authorization: "Basic " + auth },
      });
    }
  }, []);
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Private Page</h1>
      <p>This page is only visible to you after authentication.</p>
      <p>Shushh it a secret, just keep it between us.</p>
    </div>
  );
}


