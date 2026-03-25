"use client";
import { useState, useEffect } from "react";

const USERNAME = "rtuisrhtih@12050912!%";
const PASSWORD = "dobidobi";
const BLOCK_KEY = "prvtBlockedUntil";
const AUTH_KEY = "prvtAuth";

export default function PrvtPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [authenticated, setAuthenticated] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    // Check for block
    const blockedUntil = localStorage.getItem(BLOCK_KEY);
    if (blockedUntil && Date.now() < Number(blockedUntil)) {
      setBlocked(true);
      return;
    }
    // Check for auth
    if (localStorage.getItem(AUTH_KEY) === "1") {
      setAuthenticated(true);
    }
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (username === USERNAME && password === PASSWORD) {
      localStorage.setItem(AUTH_KEY, "1");
      setAuthenticated(true);
    } else {
      setAttempts(a => {
        const next = a + 1;
        if (next >= 2) {
          localStorage.setItem(BLOCK_KEY, String(Date.now() + 24 * 60 * 60 * 1000));
          setBlocked(true);
        }
        return next;
      });
      setError("Invalid username or password");
    }
  }

  function handleLogout() {
    localStorage.removeItem(AUTH_KEY);
    setAuthenticated(false);
    setUsername("");
    setPassword("");
    setAttempts(0);
  }

  if (blocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Access Blocked</h1>
        <p className="text-lg">Too many failed attempts. Try again in 24 hours.</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Private Login</h1>
        <form className="flex flex-col gap-4 w-80" onSubmit={handleLogin}>
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
          {attempts > 0 && attempts < 2 && (
            <div className="text-sm text-gray-500">Attempt {attempts} of 2</div>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Private Page</h1>
      <p>This page is only visible to you after authentication.</p>
      <p>Shushh it a secret, just keep it between us.</p>
      <button className="mt-6 bg-gray-300 text-black rounded px-3 py-2" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}


