"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MIN_PASSWORD = 8;

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (mode === "signup" && password.length < MIN_PASSWORD) {
      setError(`Use a password of at least ${MIN_PASSWORD} characters.`);
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { data: { display_name: name.trim() } } });
    setBusy(false);

    if (result.error) {
      setError(
        result.error.message === "Invalid login credentials"
          ? "That email and password don't match an account."
          : result.error.message,
      );
      return;
    }
    if (!result.data.session) {
      // Email confirmation is switched on in Supabase.
      setNotice("Check your email to confirm your account, then sign in.");
      setMode("signin");
      return;
    }
    router.replace(next);
    router.refresh();
  }

  const isSignup = mode === "signup";
  return (
    <form onSubmit={submit} className="space-y-4">
      {isSignup && (
        <label className="block">
          <span className="text-sm font-medium">Your name</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            maxLength={60}
            className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2"
          />
        </label>
      )}
      <label className="block">
        <span className="text-sm font-medium">Email</span>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Password</span>
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={isSignup ? "new-password" : "current-password"}
          minLength={isSignup ? MIN_PASSWORD : undefined}
          className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2"
        />
      </label>

      {error && (
        <p role="alert" className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-900 dark:bg-rose-950 dark:text-rose-200">
          {error}
        </p>
      )}
      {notice && <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm">{notice}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-accent px-4 py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
      </button>
      <p className="text-center text-sm text-muted">
        {isSignup ? "Already have an account?" : "New here?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(isSignup ? "signin" : "signup");
            setError(null);
          }}
          className="font-medium text-accent hover:underline"
        >
          {isSignup ? "Sign in" : "Create an account"}
        </button>
      </p>
    </form>
  );
}
