import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, GitBranch, User } from "lucide-react";
import { login, githubLogin } from "../firebase/authService";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import PasswordInput from "../components/ui/PasswordInput";
import Button from "../components/ui/Button";
import Divider from "../components/ui/Divider";

export default function Login() {
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await login(email, password);

      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      if (
        error instanceof Error &&
        error.message.includes("auth/invalid-credential")
      ) {
        setError("Invalid email or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#fafafa]">
      {/* Card */}

      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <Card>
          <div className="mb-10 flex flex-col items-center">
            <GitBranch size={56} strokeWidth={1.8} className="mb-6" />

            <h1 className="text-5xl font-bold tracking-tight">Welcome back</h1>

            <p className="mt-3 text-lg text-gray-500">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
            />

            <div className="mb-8 flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Remember me
              </label>

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="button"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <Divider />

            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                try {
                  setError("");
                  setLoading(true);

                  await githubLogin();

                  navigate("/dashboard");
                } catch (error) {
                  console.error(error);

                  setError("GitHub sign-up failed. Please try again.");
                } finally {
                  setLoading(false);
                }
              }}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-3 font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <User size={20} />
              Sign up with GitHub
            </button>

            <p className="mt-10 text-center text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-blue-600 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </form>
        </Card>
      </div>

      <footer className="flex flex-wrap justify-center gap-8 border-t bg-white px-6 py-6 text-sm text-gray-500">
        <span>© 2026 MergeMate</span>
      </footer>
    </main>
  );
}
