"use client";
import { useEffect } from "react";

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


