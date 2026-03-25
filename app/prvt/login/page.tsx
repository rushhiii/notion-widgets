"use client";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function PrvtLogin() {
  const { data: session } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
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

  // Dynamic card background style
  
  const cardBg = {
    background:
      `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.04) 0%, transparent 30%),` +
      `rgba(17,17,23,.8)`
  };


  // Mouse move handler
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  return (
    <main className="relative min-h-screen w-full bg-zinc-950 flex items-center justify-center overflow-hidden">
      {/* Subtle radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.18),transparent_60%)] pointer-events-none z-0" />
      <div className="relative z-10 flex flex-col items-center justify-center w-full px-4 py-10">
        <div
          ref={cardRef}
          className="landing-card flex flex-col w-full max-w-md rounded-3xl border border-zinc-800 backdrop-blur p-8 shadow-xl transition-colors duration-300"
          style={cardBg}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onMouseMove={handleMouseMove}
        >
          <h1 className="text-3xl font-semibold text-white mb-7 text-center tracking-tight">Private Login</h1>
          {/* <p className="text-zinc-400 text-center mb-6 text-sm">Access to this section is restricted. Please log in to continue.</p> */}
          {blocked ? (
            <div className="text-red-500 text-center font-medium py-4">Too many failed attempts.<br />Try again in 24 hours.</div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <input
                className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
              <input
                className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <div className="flex gap-3 mt-2">
                <button
                  className="cta flex-1 inline-flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-2 transition shadow"
                  type="submit"
                  disabled={blocked}
                >
                  Login
                </button>
                <button
                  className="flex-1 inline-flex items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium px-4 py-2 transition border border-zinc-700"
                  type="button"
                  onClick={handleCancel}
                  disabled={blocked}
                >
                  Cancel
                </button>
              </div>
              {error && <div className="text-red-500 text-center text-sm font-medium mt-2">{error}</div>}
              {attempts > 0 && attempts < 2 && (
                <div className="text-xs text-zinc-400 text-center">Attempt {attempts} of 2</div>
              )}
            </form>
          )}
        </div>
        {/* <footer className="mt-8 text-xs text-zinc-500 text-center opacity-80">
          <p>Tip: Only you can access this area. <span className="hidden md:inline">Contact the site owner if you believe this is an error.</span></p>
        </footer> */}
      </div>
    </main>
  );
}
