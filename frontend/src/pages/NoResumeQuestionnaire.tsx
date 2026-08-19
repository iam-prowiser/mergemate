import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GitMergeConflict,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import { useAuth } from "../context/AuthContext";

type SkillLevel = "beginner" | "comfortable" | "advanced";

interface Skill {
  name: string;
  level: SkillLevel;
}

interface ProfileData {
  source: "questionnaire";

  targetRole: string;
  experience: string;
  careerGoal: string;

  skills: Skill[];

  projectCount: string;
  projectTypes: string[];
  projectDescription: string;

  gitExperience: string;
  githubExperience: string;
  contributions: string;

  learningGoals: string[];
  struggles: string[];
}

const roles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "AI / ML Engineer",
  "DevOps Engineer",
  "Data Engineer",
  "Mobile Developer",
];

const experienceLevels = [
  "Complete beginner",
  "Beginner",
  "Intermediate",
  "Advanced",
];

const careerGoals = [
  "Get my first developer job",
  "Prepare for internships",
  "Become job-ready",
  "Improve my existing skills",
  "Start contributing to open source",
  "Transition into a new role",
];

const skillOptions = [
  "C",
  "C++",
  "Java",
  "Python",
  "JavaScript",
  "TypeScript",
  "HTML",
  "CSS",
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "FastAPI",
  "Django",
  "Spring Boot",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Docker",
  "AWS",
  "Git",
  "GitHub",
  "NumPy",
  "Pandas",
  "scikit-learn",
  "TensorFlow",
  "PyTorch",
];

const projectTypes = [
  "Web applications",
  "APIs",
  "Mobile apps",
  "AI / ML projects",
  "Automation / tools",
  "Data projects",
  "Games",
];

const learningOptions = [
  "Frontend development",
  "Backend development",
  "Databases",
  "System design",
  "AI / ML",
  "DevOps / Cloud",
  "Data structures & algorithms",
  "Open source",
  "Testing",
];

const struggleOptions = [
  "I don't know what to build",
  "I struggle to read existing code",
  "I don't know how to contribute to GitHub",
  "I lack real-world experience",
  "I struggle with debugging",
  "I don't know which technologies to learn",
  "I struggle with DSA",
  "I struggle with system design",
];

const totalSteps = 7;

export default function NoResumeQuestionnaire() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);

  const [targetRole, setTargetRole] = useState("");
  const [experience, setExperience] = useState("");
  const [careerGoal, setCareerGoal] = useState("");

  const [skills, setSkills] = useState<Skill[]>([]);

  const [projectCount, setProjectCount] = useState("");
  const [selectedProjectTypes, setSelectedProjectTypes] = useState<string[]>(
    [],
  );
  const [projectDescription, setProjectDescription] = useState("");

  const [gitExperience, setGitExperience] = useState("");
  const [githubExperience, setGithubExperience] = useState("");
  const [contributions, setContributions] = useState("");

  const [learningGoals, setLearningGoals] = useState<string[]>([]);
  const [struggles, setStruggles] = useState<string[]>([]);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleSkill(skillName: string) {
    setSkills((current) => {
      const existing = current.find(
        (skill) => skill.name === skillName,
      );

      if (existing) {
        return current.filter(
          (skill) => skill.name !== skillName,
        );
      }

      return [
        ...current,
        {
          name: skillName,
          level: "beginner",
        },
      ];
    });
  }

  function updateSkillLevel(
    skillName: string,
    level: SkillLevel,
  ) {
    setSkills((current) =>
      current.map((skill) =>
        skill.name === skillName
          ? { ...skill, level }
          : skill,
      ),
    );
  }

  function toggleArrayValue(
    value: string,
    current: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) {
    if (current.includes(value)) {
      setter(current.filter((item) => item !== value));
    } else {
      setter([...current, value]);
    }
  }

  function validateStep() {
    setError("");

    if (step === 1) {
      if (!targetRole) {
        setError("Choose the role you're working toward.");
        return false;
      }

      if (!experience) {
        setError("Tell us about your current experience.");
        return false;
      }

      if (!careerGoal) {
        setError("Choose your main career goal.");
        return false;
      }
    }

    if (step === 2 && skills.length === 0) {
      setError("Select at least one skill you currently know.");
      return false;
    }

    if (step === 3) {
      if (skills.length === 0) {
        setError("Select at least one skill first.");
        return false;
      }
    }

    if (step === 4) {
      if (!projectCount) {
        setError(
          "Tell us roughly how many projects you've built.",
        );
        return false;
      }
    }

    if (step === 5) {
      if (!gitExperience) {
        setError("Tell us about your Git experience.");
        return false;
      }

      if (!githubExperience) {
        setError("Tell us about your GitHub experience.");
        return false;
      }

      if (!contributions) {
        setError(
          "Tell us about your open-source contributions.",
        );
        return false;
      }
    }

    if (step === 6) {
      if (learningGoals.length === 0) {
        setError(
          "Choose at least one area you want to improve.",
        );
        return false;
      }

      if (struggles.length === 0) {
        setError(
          "Choose at least one area you struggle with.",
        );
        return false;
      }
    }

    return true;
  }

  function handleNext() {
    if (!validateStep()) {
      return;
    }

    if (step < totalSteps) {
      setStep((current) => current + 1);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  function handleBack() {
    setError("");

    if (step > 1) {
      setStep((current) => current - 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  /*
   * ============================================================
   * FINAL SUBMISSION
   * ============================================================
   *
   * IMPORTANT:
   *
   * The old implementation only saved mergemateProfile and
   * immediately navigated to /dashboard.
   *
   * Dashboard needs skillGapResult.
   *
   * Therefore we:
   *
   * 1. Build questionnaire profile
   * 2. Save profile
   * 3. Get Firebase ID token
   * 4. Send profile to AI skill-gap endpoint
   * 5. Save AI response as skillGapResult
   * 6. Navigate to dashboard
   *
   * We DO NOT navigate if the AI request fails.
   */

  async function handleSubmit() {
    if (!validateStep()) {
      return;
    }

    if (!user) {
      setError("You must be signed in to continue.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      /*
       * ========================================================
       * 1. Build complete questionnaire profile
       * ========================================================
       */

      const profile: ProfileData = {
        source: "questionnaire",

        targetRole,
        experience,
        careerGoal,

        skills,

        projectCount,
        projectTypes: selectedProjectTypes,
        projectDescription,

        gitExperience,
        githubExperience,
        contributions,

        learningGoals,
        struggles,
      };

      /*
       * ========================================================
       * 2. Persist questionnaire profile
       * ========================================================
       */

      sessionStorage.setItem(
        "mergemateProfile",
        JSON.stringify(profile),
      );

      /*
       * ========================================================
       * 3. Convert questionnaire into resume-style profile text
       *
       * The existing /api/ai/skill-gap endpoint expects:
       *
       * resume_markdown
       *
       * Since this user does not have a resume, we construct
       * the profile as structured markdown.
       * ========================================================
       */

      const profileText = `
# MergeMate Developer Profile

## Career Direction

Target Role: ${targetRole}
Current Experience: ${experience}
Career Goal: ${careerGoal}

## Current Technical Skills

${skills
  .map(
    (skill) =>
      `- ${skill.name}: ${skill.level}`,
  )
  .join("\n")}

## Projects

Number of Projects: ${projectCount}

Project Types:
${
  selectedProjectTypes.length > 0
    ? selectedProjectTypes
        .map((type) => `- ${type}`)
        .join("\n")
    : "- None specified"
}

Best Project Description:
${
  projectDescription.trim() ||
  "Not provided"
}

## Git Experience

${gitExperience}

## GitHub Experience

${githubExperience}

## Open Source Contributions

${contributions}

## Learning Goals

${
  learningGoals.length > 0
    ? learningGoals
        .map((goal) => `- ${goal}`)
        .join("\n")
    : "- None specified"
}

## Current Struggles

${
  struggles.length > 0
    ? struggles
        .map((struggle) => `- ${struggle}`)
        .join("\n")
    : "- None specified"
}
      `.trim();

      /*
       * ========================================================
       * 4. Get Firebase authentication token
       * ========================================================
       */

      const idToken = await user.getIdToken();

      /*
       * ========================================================
       * 5. Prepare AI request
       * ========================================================
       */

      const payload = {
        resume_markdown: profileText,
        target_role: targetRole,
        experience,
        contributions,
      };

      

      /*
       * ========================================================
       * 6. Call backend AI endpoint
       * ========================================================
       */

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

      /*
       * ========================================================
       * 7. Parse response
       * ========================================================
       */

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }


      /*
       * ========================================================
       * 8. Handle backend errors
       * ========================================================
       */

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Skill-gap analysis failed. Please try again.",
        );
      }

      /*
       * ========================================================
       * 9. Store AI result
       *
       * THIS WAS THE MISSING PART.
       *
       * Dashboard reads skillGapResult.
       * ========================================================
       */

      sessionStorage.setItem(
        "skillGapResult",
        JSON.stringify(data),
      );

      

      /*
       * ========================================================
       * 10. Navigate only after successful AI analysis
       * ========================================================
       */

      navigate("/dashboard");
    } catch (error) {
      console.error(
        "No-resume skill-gap request failed:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderStep() {
    switch (step) {
      case 1:
        return (
          <>
            <Navbar />

            <SectionTitle
              title="Let's build your developer profile"
              description="Since you don't have a resume, we'll learn about your background through a few questions."
            />

            <Field label="What role are you working toward?">
              <div className="grid gap-3 sm:grid-cols-2">
                {roles.map((role) => (
                  <Choice
                    key={role}
                    selected={targetRole === role}
                    onClick={() => setTargetRole(role)}
                    label={role}
                  />
                ))}
              </div>
            </Field>

            <Field label="How would you describe your experience?">
              <div className="grid gap-3 sm:grid-cols-2">
                {experienceLevels.map((level) => (
                  <Choice
                    key={level}
                    selected={experience === level}
                    onClick={() => setExperience(level)}
                    label={level}
                  />
                ))}
              </div>
            </Field>

            <Field label="What are you trying to achieve?">
              <div className="space-y-3">
                {careerGoals.map((goal) => (
                  <Choice
                    key={goal}
                    selected={careerGoal === goal}
                    onClick={() => setCareerGoal(goal)}
                    label={goal}
                  />
                ))}
              </div>
            </Field>
          </>
        );

      case 2:
        return (
          <>
            <SectionTitle
              title="What do you know?"
              description="Select everything you've worked with. Don't worry about being an expert."
            />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {skillOptions.map((skill) => {
                const selected = skills.some(
                  (item) => item.name === skill,
                );

                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                      selected
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{skill}</span>

                      {selected && (
                        <Check size={17} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Selected: {skills.length}
            </p>
          </>
        );

      case 3:
        return (
          <>
            <SectionTitle
              title="How comfortable are you?"
              description="Be honest. MergeMate uses this to avoid recommending issues that are far beyond your current level."
            />

            <div className="space-y-5">
              {skills.map((skill) => (
                <div
                  key={skill.name}
                  className="rounded-xl border border-gray-200 bg-white p-5"
                >
                  <div className="mb-4 font-semibold text-gray-900">
                    {skill.name}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {(
                      [
                        ["beginner", "Beginner"],
                        ["comfortable", "Comfortable"],
                        ["advanced", "Advanced"],
                      ] as const
                    ).map(([value, label]) => (
                      <Choice
                        key={value}
                        selected={skill.level === value}
                        onClick={() =>
                          updateSkillLevel(
                            skill.name,
                            value,
                          )
                        }
                        label={label}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        );

      case 4:
        return (
          <>
            <SectionTitle
              title="Tell us about your projects"
              description="Projects help us understand what you've actually built, even if you don't have a resume."
            />

            <Field label="How many projects have you built?">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "No projects yet",
                  "1–2 projects",
                  "3–5 projects",
                  "5+ projects",
                ].map((value) => (
                  <Choice
                    key={value}
                    selected={projectCount === value}
                    onClick={() => setProjectCount(value)}
                    label={value}
                  />
                ))}
              </div>
            </Field>

            <Field label="What kind of projects have you built?">
              <div className="grid gap-3 sm:grid-cols-2">
                {projectTypes.map((type) => (
                  <Choice
                    key={type}
                    selected={selectedProjectTypes.includes(type)}
                    onClick={() =>
                      toggleArrayValue(
                        type,
                        selectedProjectTypes,
                        setSelectedProjectTypes,
                      )
                    }
                    label={type}
                  />
                ))}
              </div>
            </Field>

            <Field
              label="Tell us about your best project"
              optional
            >
              <textarea
                value={projectDescription}
                onChange={(e) =>
                  setProjectDescription(e.target.value)
                }
                placeholder="What did you build? What technologies did you use? What did you learn?"
                rows={5}
                className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </Field>
          </>
        );

      case 5:
        return (
          <>
            <SectionTitle
              title="How comfortable are you with GitHub?"
              description="Open-source contribution requires more than knowing a programming language."
            />

            <Field label="Your Git experience">
              <div className="space-y-3">
                {[
                  "I've never used Git",
                  "I know basic Git commands",
                  "I'm comfortable with Git",
                  "I'm comfortable with Git branches and pull requests",
                ].map((value) => (
                  <Choice
                    key={value}
                    selected={gitExperience === value}
                    onClick={() => setGitExperience(value)}
                    label={value}
                  />
                ))}
              </div>
            </Field>

            <Field label="Your GitHub experience">
              <div className="space-y-3">
                {[
                  "I've barely used GitHub",
                  "I use GitHub for my projects",
                  "I understand issues and pull requests",
                  "I'm comfortable navigating repositories",
                ].map((value) => (
                  <Choice
                    key={value}
                    selected={githubExperience === value}
                    onClick={() =>
                      setGithubExperience(value)
                    }
                    label={value}
                  />
                ))}
              </div>
            </Field>

            <Field label="Have you contributed to open source?">
              <div className="space-y-3">
                {[
                  "Never",
                  "I've tried but haven't contributed yet",
                  "1–3 contributions",
                  "4–10 contributions",
                  "10+ contributions",
                ].map((value) => (
                  <Choice
                    key={value}
                    selected={contributions === value}
                    onClick={() => setContributions(value)}
                    label={value}
                  />
                ))}
              </div>
            </Field>
          </>
        );

      case 6:
        return (
          <>
            <SectionTitle
              title="What do you want to improve?"
              description="This is where MergeMate starts understanding where you want to go, not just where you are today."
            />

            <Field label="Which areas do you want to learn?">
              <div className="grid gap-3 sm:grid-cols-2">
                {learningOptions.map((option) => (
                  <Choice
                    key={option}
                    selected={learningGoals.includes(option)}
                    onClick={() =>
                      toggleArrayValue(
                        option,
                        learningGoals,
                        setLearningGoals,
                      )
                    }
                    label={option}
                  />
                ))}
              </div>
            </Field>

            <Field label="What do you struggle with?">
              <div className="space-y-3">
                {struggleOptions.map((option) => (
                  <Choice
                    key={option}
                    selected={struggles.includes(option)}
                    onClick={() =>
                      toggleArrayValue(
                        option,
                        struggles,
                        setStruggles,
                      )
                    }
                    label={option}
                  />
                ))}
              </div>
            </Field>
          </>
        );

      case 7:
        return (
          <>
            <SectionTitle
              title="Your MergeMate profile"
              description="Review what you've told us before we generate your personalized profile."
            />

            <div className="space-y-4">
              <SummaryCard
                title="Career direction"
                value={`${targetRole} · ${experience}`}
              />

              <SummaryCard
                title="Career goal"
                value={careerGoal}
              />

              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Skills
                </p>

                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill.name}
                      className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                    >
                      {skill.name} · {skill.level}
                    </span>
                  ))}
                </div>
              </div>

              <SummaryCard
                title="Projects"
                value={`${projectCount}${
                  selectedProjectTypes.length
                    ? ` · ${selectedProjectTypes.join(", ")}`
                    : ""
                }`}
              />

              <SummaryCard
                title="GitHub"
                value={githubExperience}
              />

              <SummaryCard
                title="Learning goals"
                value={learningGoals.join(", ")}
              />

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                <div className="flex gap-3">
                  <GitMergeConflict
                    size={20}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <div>
                    <p className="font-semibold text-gray-900">
                      What happens next?
                    </p>

                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      MergeMate will use this profile to
                      understand your current foundation,
                      identify skill gaps, and find
                      open-source issues that match your
                      level and goals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8fa] px-6 py-10 text-gray-900">
      <div className="mx-auto w-full max-w-3xl">

        {/* Header */}

        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate("/onboarding")}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                MergeMate profile
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight">
                Tell us about yourself
              </h1>
            </div>

            <div className="text-sm font-medium text-gray-400">
              {step} / {totalSteps}
            </div>
          </div>

          {/* Progress */}

          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{
                width: `${(step / totalSteps) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Main card */}

        <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm sm:p-9">
          {renderStep()}

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Navigation */}

          <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1 || isSubmitting}
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowLeft size={17} />
              Back
            </button>

            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-[#2f6feb] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#245dcc] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Continue
                <ArrowRight size={17} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-[#2f6feb] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#245dcc] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Analyzing your profile..."
                  : "Generate my profile"}

                {!isSubmitting && (
                  <ArrowRight size={17} />
                )}
              </button>
            )}
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-gray-400">
          You can update your profile later.
        </p>
      </div>
    </main>
  );
}

/* ============================================================
   SECTION TITLE
============================================================ */

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold tracking-tight">
        {title}
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
}

/* ============================================================
   FIELD
============================================================ */

function Field({
  label,
  children,
  optional = false,
}: {
  label: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <label className="text-sm font-semibold text-gray-900">
          {label}
        </label>

        {optional && (
          <span className="text-xs text-gray-400">
            Optional
          </span>
        )}
      </div>

      {children}
    </div>
  );
}

/* ============================================================
   CHOICE
============================================================ */

function Choice({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
        selected
          ? "border-blue-500 bg-blue-50 text-blue-700"
          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span>{label}</span>

        {selected && (
          <Check
            size={17}
            className="shrink-0 text-blue-600"
          />
        )}
      </div>
    </button>
  );
}

/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {title}
      </p>

      <p className="mt-2 text-sm font-medium leading-6 text-gray-900">
        {value || "Not provided"}
      </p>
    </div>
  );
}