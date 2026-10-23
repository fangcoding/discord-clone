"use client";

import { useState } from "react";
import type { AuthResult } from "@/lib/useChatData";
import { fieldClass, labelClass, submitClass } from "./Modal";
import { DiscordLogo } from "./icons";

type AuthScreenProps = {
  onSignIn: (email: string, password: string) => Promise<AuthResult>;
  onSignUp: (
    email: string,
    password: string,
    username: string,
  ) => Promise<AuthResult>;
};

type Mode = "login" | "signup";

export default function AuthScreen({ onSignIn, onSignUp }: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function switchMode() {
    setMode((current) => (current === "login" ? "signup" : "login"));
    setError(null);
    setNotice(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    const emailValue = email.trim();
    const usernameValue = username.trim();

    if (!emailValue || !password) {
      setError("Enter your email and password.");
      return;
    }
    if (mode === "signup" && !usernameValue) {
      setError("Pick a username.");
      return;
    }

    setSubmitting(true);
    const result =
      mode === "login"
        ? await onSignIn(emailValue, password)
        : await onSignUp(emailValue, password, usernameValue);
    setSubmitting(false);

    setError(result.error);
    setNotice(result.notice);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-d-chat px-4 py-10">
      <div className="w-full max-w-[460px] rounded-md bg-d-sidebar p-8 shadow-2xl">
        <div className="mb-4 flex justify-center">
          <DiscordLogo className="h-10 w-10 text-d-blurple" />
        </div>

        <h1 className="text-center text-[24px] font-semibold text-white">
          {mode === "login" ? "Welcome back!" : "Create an account"}
        </h1>
        <p className="mt-1 text-center text-[15px] text-d-muted">
          {mode === "login"
            ? "We're so excited to see you again."
            : "Sign up to start chatting with your friends."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <div>
              <label className={labelClass} htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="nova"
                className={fieldClass}
              />
            </div>
          )}

          <div>
            <label className={labelClass} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className={fieldClass}
            />
          </div>

          {error && <p className="text-[13px] text-d-red">{error}</p>}
          {notice && <p className="text-[13px] text-d-green">{notice}</p>}

          <button type="submit" disabled={submitting} className={submitClass}>
            {submitting
              ? "Please wait…"
              : mode === "login"
                ? "Log In"
                : "Sign Up"}
          </button>
        </form>

        <p className="mt-3 text-[14px] text-d-muted">
          <button
            type="button"
            onClick={switchMode}
            className="font-medium text-d-blurple hover:underline"
          >
            {mode === "login"
              ? "Need an account? Register"
              : "Already registered? Log In"}
          </button>
        </p>
      </div>
    </main>
  );
}
