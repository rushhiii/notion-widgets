"use client";
import { useState, useRef, FormEvent } from "react";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

type SessionWithUser = Session & {
  user: Session["user"] & { id: string; username?: string; role?: string };
};

type Props = {
  session: SessionWithUser;
  setShowAccountModal: (open: boolean) => void;
};

export default function AccountSettingsForm({ session, setShowAccountModal }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  // Use a controlled input for username, initialize from session when modal opens
  // Use a ref for username input, and force re-mount on session.user.username change
  const usernameRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const name = nameRef.current?.value.trim() || "";
    const usernameVal = usernameRef.current?.value.trim() || "";
    const password = passwordRef.current?.value || "";
    if (!session?.user?.id) {
      setError("Session missing user id. Please sign in again.");
      setLoading(false);
      return;
    }
    if (!usernameVal) {
      setError("Username is required.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: session.user.id, name, username: usernameVal, password }),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        setError("Server error: Invalid JSON response");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError((data && data.error ? data.error : "Failed to update user") + (data && data.details ? ": " + data.details : ""));
      } else {
        setSuccess("Account updated! You will be logged out to apply changes.");
        if (setShowAccountModal) setShowAccountModal(false);
        setTimeout(() => {
          signOut({ callbackUrl: "/prvt/login" });
        }, 900);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError("Server error: " + msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-zinc-300">Display Name</span>
        <input ref={nameRef} type="text" className="rounded-lg px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-100 focus:border-violet-600 focus:ring-2 focus:ring-violet-700 outline-none transition" defaultValue={session?.user?.name || ""} />
      </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-300">Username</span>
          <input
            ref={usernameRef}
            type="text"
            required
            className="rounded-lg px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-100 focus:border-violet-600 focus:ring-2 focus:ring-violet-700 outline-none transition"
            defaultValue={session?.user?.username || ""}
            key={session?.user?.username || "username-field"}
          />
        </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-zinc-300">Password</span>
        <input ref={passwordRef} type="password" className="rounded-lg px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-100 focus:border-violet-600 focus:ring-2 focus:ring-violet-700 outline-none transition" placeholder="New password" autoComplete="new-password" />
      </label>
      {error && <div className="text-red-400 text-sm font-medium text-center mt-1">{error}</div>}
      {success && <div className="text-green-400 text-sm font-medium text-center mt-1">{success}</div>}
      <div className="flex gap-2 mt-4">
        <button type="submit" disabled={loading} className="flex-1 bg-violet-700 hover:bg-violet-800 text-white px-4 py-2 rounded-xl font-semibold transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => {
            signOut({ callbackUrl: "/prvt/signout", redirect: false }).finally(() => {
              window.location.replace("/prvt/signout");
            });
          }}
          className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-red-700 text-red-200 hover:text-white px-4 py-2 rounded-xl font-semibold transition shadow-md border border-red-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="size-5 fill-red-200 group-hover:fill-white">
            <path d="M569 337C578.4 327.6 578.4 312.4 569 303.1L425 159C418.1 152.1 407.8 150.1 398.8 153.8C389.8 157.5 384 166.3 384 176L384 256L272 256C245.5 256 224 277.5 224 304L224 336C224 362.5 245.5 384 272 384L384 384L384 464C384 473.7 389.8 482.5 398.8 486.2C407.8 489.9 418.1 487.9 425 481L569 337zM224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L160 96C107 96 64 139 64 192L64 448C64 501 107 544 160 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L160 480C142.3 480 128 465.7 128 448L128 192C128 174.3 142.3 160 160 160L224 160z" />
          </svg>
          Logout
        </button>
      </div>
    </form>
  );
}

