"use client";

/**
 * Sign-up page (T016)
 *
 * Provides a registration form that validates email format and password length
 * (FR-015: valid email address, FR-016: password minimum 8 characters) before
 * calling Better Auth's signUp.email helper. On success the user is redirected
 * to /dashboard. Duplicate-email errors are surfaced with a user-friendly
 * message; all other errors fall back to a generic message.
 */

import { useState, FormEvent } from "react";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";

// Minimal email format check that avoids false negatives while satisfying FR-015.
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    // Client-side validation (FR-015, FR-016).
    if (!isValidEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await signUp.email({
        email,
        password,
        // Better Auth requires a `name` field; default to the email address.
        name: email,
      });
      // Redirect to dashboard on success.
      window.location.href = "/dashboard";
    } catch (error: unknown) {
      // Provide a helpful message for the duplicate-email case; otherwise use
      // a generic fallback so we do not leak internal details.
      const message =
        error instanceof Error ? error.message : String(error);
      if (message.toLowerCase().includes("already") || message.toLowerCase().includes("exist")) {
        setErrorMessage("Email already in use. Try signing in instead.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Create an account</h1>
          <p className="text-sm text-gray-500 mb-6">Sign up to manage your tasks securely.</p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email field */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            {/* Password field */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="At least 8 characters"
              />
            </div>

            {/* Inline error message */}
            {errorMessage && (
              <p role="alert" className="text-red-600 text-sm mb-4">
                {errorMessage}
              </p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {isLoading ? "Creating account…" : "Create account"}
            </button>
          </form>

          {/* Link to sign-in */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
