import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { FormEvent } from "react";

import {
  GitBranch,
  User,
  Mail,
  Lock,
  GitMergeConflict,
} from "lucide-react";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Divider from "../components/ui/Divider";
import Input from "../components/ui/Input";
import PasswordInput from "../components/ui/PasswordInput";

import { register, githubLogin } from "../firebase/authService";

export default function Signup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // REAL FIREBASE REGISTRATION
      await register(fullName.trim(), email.trim(), password);

      // Only navigate after Firebase successfully creates the account
      navigate("/onboarding");
    } catch (error: any) {
      console.error("Signup error:", error);

      switch (error?.code) {
        case "auth/email-already-in-use":
          setError("An account with this email already exists.");
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/weak-password":
          setError("Your password is too weak.");
          break;

        case "auth/operation-not-allowed":
          setError(
            "Email/password authentication is not enabled in Firebase."
          );
          break;

        case "auth/invalid-api-key":
          setError(
            "Firebase is not configured correctly. Please try again later."
          );
          break;

        default:
          setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGithubSignup() {
    try {
      setError("");
      setLoading(true);

      await githubLogin();

      navigate("/dashboard");
    } catch (error: any) {
      console.error("GitHub authentication failed:", error);

      setError(
        "GitHub sign-up failed. Please make sure GitHub authentication is configured."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <Card>
          <div className="mb-8 flex flex-col items-center">
            <GitBranch
              size={52}
              strokeWidth={1.8}
              className="mb-6"
            />

            <h1 className="text-4xl font-bold tracking-tight">
              Create your account
            </h1>

            <p className="mt-2 text-gray-500">
              Join and get started today
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Input
              label="Full name"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              icon={<User size={18} />}
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
            />

            <PasswordInput
              label="Password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
            />

            <p className="mb-5 -mt-3 text-xs text-gray-500">
              Use at least 8 characters with a mix of letters, numbers &amp;
              symbols.
            </p>

            <PasswordInput
              label="Confirm password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock size={18} />}
            />

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Sign up"}
            </Button>

            <Divider />

            <button
              type="button"
              disabled={loading}
              onClick={handleGithubSignup}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-3 font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <GitMergeConflict size={20} />
              Sign up with GitHub
            </button>

            <p className="mt-8 text-center text-gray-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </Card>
      </div>

      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-8 px-6 py-6 text-sm text-gray-500">
          <span>© 2026 MergeMate</span>
        </div>
      </footer>
    </main>
  );
}