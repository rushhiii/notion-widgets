"use client";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PrvtLogin() {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (session) router.push("/prvt");
    // Block logic
    const blockedUntil = localStorage.getItem("prvtBlockedUntil");
    if (blockedUntil && Date.now() < Number(blockedUntil)) {
      setBlocked(true);
      setTimeout(() => router.replace("/prvt/not-found"), 1000);
    }
  }, [session, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    if (res?.ok) {
      router.push("/prvt");
    } else {
      setAttempts(a => {
        const next = a + 1;
        if (next >= 2) {
          localStorage.setItem("prvtBlockedUntil", String(Date.now() + 24 * 60 * 60 * 1000));
          setBlocked(true);
          setTimeout(() => router.replace("/prvt/not-found"), 1000);
        }
        return next;
      });
      setError("Invalid username or password");
    }
  }

  function handleCancel() {
    router.replace("/prvt/not-found");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Private Login</h1>
      {blocked ? (
        <div className="text-red-600">Too many failed attempts. Try again in 24 hours.</div>
      ) : (
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
          <div className="flex gap-2">
            <button className="bg-black text-white rounded px-3 py-2" type="submit">
              Login
            </button>
            <button className="bg-gray-300 text-black rounded px-3 py-2" type="button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {attempts > 0 && attempts < 2 && (
            <div className="text-sm text-gray-500">Attempt {attempts} of 2</div>
          )}
        </form>
      )}
    </div>
  );
}
