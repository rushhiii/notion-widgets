"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PrvtLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    // Try to fetch a protected page with basic auth
    const res = await fetch("/prvt", {
      headers: {
        Authorization: "Basic " + btoa(`${username}:${password}`),
      },
    });
    if (res.ok) {
      // Save credentials in sessionStorage for future requests
      sessionStorage.setItem("prvtAuth", btoa(`${username}:${password}`));
      router.push("/prvt");
    } else {
      setError("Invalid username or password");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Private Login</h1>
      <form className="flex flex-col gap-4 w-80" onSubmit={handleSubmit}>
        <input
          className="border rounded px-3 py-2"
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          className="border rounded px-3 py-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button className="bg-black text-white rounded px-3 py-2" type="submit">
          Login
        </button>
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </form>
    </div>
  );
}
