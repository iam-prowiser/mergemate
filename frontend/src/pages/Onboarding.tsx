import { useState } from "react";
import { FileText, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Navbar from "../components/layout/Navbar";

export default function Onboarding() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [resume, setResume] = useState<File | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      return;
    }

    setResume(file);
  }

  async function handleContinue() {
    setError("");

    // User chose to skip the resume
    if (!resume) {
      navigate("/no-resume-questionnaire");
      return;
    }

    if (!user) {
      setError("You must be logged in to upload a resume.");
      return;
    }

    try {
      setLoading(true);

      const idToken = await user.getIdToken();

      const formData = new FormData();

      formData.append("file", resume);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/resume/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to process resume.");
      }

      sessionStorage.setItem("resumeMarkdown", data.markdown);

      navigate("/questionnaire");
    } catch (error) {
      console.error("Resume processing failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to process your resume.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen items-center justify-center bg-[#f6f8fa] px-6">
        <Card>
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100">
              <FileText size={28} className="text-gray-700" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              Let's get to know you
            </h1>

            <p className="mt-3 text-gray-500">
              Upload your resume so we can understand your current skills and
              find suitable open-source opportunities.
            </p>
          </div>

          <div className="mt-8">
            <label
              htmlFor="resume"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white px-6 py-10 transition hover:border-gray-500 hover:bg-gray-50"
            >
              <Upload size={28} className="mb-3 text-gray-500" />

              {resume ? (
                <>
                  <p className="font-medium text-gray-900">{resume.name}</p>

                  <p className="mt-1 text-sm text-gray-500">Click to replace</p>
                </>
              ) : (
                <>
                  <p className="font-medium text-gray-900">
                    Upload your resume
                  </p>

                  <p className="mt-1 text-sm text-gray-500">PDF only</p>
                </>
              )}

              <input
                id="resume"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="mt-6">
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <Button type="button" onClick={handleContinue} disabled={loading}>
              {loading ? "Processing resume..." : "Continue"}
            </Button>
          </div>

          <button
            type="button"
            onClick={() => navigate("/no-resume-questionnaire")}
            className="mt-5 w-full text-center text-sm font-medium text-blue-600 hover:underline"
          >
            I don't have a resume
          </button>
        </Card>
      </main>
    </>
  );
}
