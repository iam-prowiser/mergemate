import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Navbar from "../components/layout/Navbar";

export default function Questionnaire() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [targetRole, setTargetRole] = useState("");
  const [experience, setExperience] = useState("");
  const [contributions, setContributions] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const resumeMarkdown = sessionStorage.getItem("resumeMarkdown");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!user) {
      setError("You must be signed in to continue.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const idToken = await user.getIdToken();

      const payload = {
        resume_markdown: resumeMarkdown,
        target_role: targetRole,
        experience,
        contributions,
      };

      console.log("Sending skill-gap request:", {
        payload,
        hasToken: Boolean(idToken),
        user: user.email,
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai/skill-gap`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(payload),
        },
      );

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      console.log("Skill-gap response status:", response.status);

      console.log("Skill-gap response:", data);

      if (!response.ok) {
        throw new Error(
          data?.detail || "Skill-gap analysis failed. Please try again.",
        );
      }

      /*
       * Store the complete AI response.
       *
       * Dashboard reads this object after navigation.
       */
      sessionStorage.setItem("skillGapResult", JSON.stringify(data));

      console.log("Skill-gap analysis completed successfully.");

      /*
       * Only navigate after the AI response has
       * successfully arrived and has been stored.
       */
      navigate("/dashboard");
    } catch (error) {
      console.error("Skill-gap request failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );

      setIsSubmitting(false);
    }
  }

  /*
   * ========================================================
   * LOADING STATE
   * ========================================================
   *
   * This screen remains visible while NIM is processing.
   * We do NOT fake a delay.
   */
  if (isSubmitting) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center bg-[#f6f8fa] px-6">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white px-8 py-10 text-center shadow-sm">
            {/* Spinner */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-blue-100 border-t-blue-600" />
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight">
              Analyzing your profile
            </h1>

            <p className="mt-3 text-sm leading-6 text-neutral-500">
              MergeMate is comparing your current skills with the requirements
              for your target role.
            </p>

            <div className="mt-6 space-y-2 text-left">
              <div className="flex items-center gap-3 rounded-lg bg-neutral-50 px-4 py-3">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />

                <span className="text-sm text-neutral-600">
                  Analyzing your experience
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-neutral-50 px-4 py-3">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />

                <span className="text-sm text-neutral-600">
                  Identifying skill gaps
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-neutral-50 px-4 py-3">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />

                <span className="text-sm text-neutral-600">
                  Building your career path
                </span>
              </div>
            </div>

            <p className="mt-6 text-xs text-neutral-400">
              This may take a few seconds.
            </p>
          </div>
        </main>
      </>
    );
  }

  /*
   * ========================================================
   * QUESTIONNAIRE
   * ========================================================
   */

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen items-center justify-center bg-[#f6f8fa] px-6 py-10">
        <Card>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              Tell us about yourself
            </h1>

            <p className="mt-2 text-gray-500">
              This helps us find issues that match your current level and goals.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* TARGET ROLE */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                What do you want to become?
              </label>

              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 outline-none focus:border-black"
                required
              >
                <option value="">Select a role</option>

                <option value="frontend">Frontend Developer</option>

                <option value="backend">Backend Developer</option>

                <option value="fullstack">Full Stack Developer</option>

                <option value="ai-ml">AI / ML Engineer</option>

                <option value="devops">DevOps Engineer</option>
              </select>
            </div>

            {/* EXPERIENCE */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                What is your current experience level?
              </label>

              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 outline-none focus:border-black"
                required
              >
                <option value="">Select your level</option>

                <option value="beginner">Beginner</option>

                <option value="intermediate">Intermediate</option>

                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* CONTRIBUTIONS */}
            <div className="mb-8">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                How much open-source contribution have you made?
              </label>

              <select
                value={contributions}
                onChange={(e) => setContributions(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 outline-none focus:border-black"
                required
              >
                <option value="">Select an option</option>

                <option value="none">None</option>

                <option value="few">1–3 contributions</option>

                <option value="some">4–10 contributions</option>

                <option value="experienced">10+ contributions</option>
              </select>
            </div>

            {/* ERROR */}
            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* SUBMIT */}
            <Button type="submit">Continue</Button>
          </form>
        </Card>
      </main>
    </>
  );
}
