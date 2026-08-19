import { useEffect, useRef, useState } from "react";
import {
  GitBranch,
  ChevronDown,
  User,
  Settings,
  Bookmark,
  HelpCircle,
  LogOut,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock3,
  ArrowLeft,
  CircleAlert,
  BookOpen,
  Code2,
  Target,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { logout } from "../firebase/authService";
import { useNavigate } from "react-router-dom";

type Issue = {
  id: number;
  repository: string;
  title: string;
  description: string;
  url: string;
  labels: string[];
  state: string;
  updated_at: string;
};

type Match = {
  issue_id: number;
  relevance_score: number;
  difficulty_fit: string;
  stack_fit: string;
  beginner_suitable: boolean;
  scope: string;
  reason: string;
  learning_value: string;
  recommended: boolean;
};

type SelectedIssue = {
  issue: Issue;
  match: Match;
};


type KickstartResponse = {
  issue_summary: string;
  what_you_need_to_know: string[];
  where_to_start: string[];
  implementation_steps: string[];
  verification_steps: string[];
  definition_of_done: string[];
};

export default function IssueDetails() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [kickstart, setKickstart] =
    useState<KickstartResponse | null>(null);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [kickstartError, setKickstartError] =
    useState("");

  const [profileOpen, setProfileOpen] =
    useState(false);

  const profileRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target as Node
        )
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  async function handleLogout() {
    try {
      setProfileOpen(false);

      await logout();

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    }
  }

  const storedIssue = sessionStorage.getItem(
    "selectedIssue"
  );

  let selected: SelectedIssue | null = null;

  try {
    selected = storedIssue
      ? JSON.parse(storedIssue)
      : null;
  } catch {
    selected = null;
  }

  if (!selected) {
    return (
      <main className="min-h-screen bg-[#f8f9fc] text-neutral-900">
        <header className="border-b border-neutral-200 bg-white">
          <div className="mx-auto flex max-w-[1200px] items-center px-8 py-4">
            <button
              onClick={() => navigate("/matches")}
              className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
            >
              <ArrowLeft size={17} />
              Back to matches
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[700px] px-6 py-24 text-center">
          <CircleAlert
            size={40}
            className="mx-auto text-neutral-400"
          />

          <h1 className="mt-5 text-2xl font-bold">
            Issue not found
          </h1>

          <p className="mt-2 text-neutral-500">
            This issue is no longer available in your current
            search results.
          </p>

          <button
            onClick={() => navigate("/matches")}
            className="mt-6 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            Back to matches
          </button>
        </div>
      </main>
    );
  }

  const { issue, match } = selected;

  return (
    <main className="min-h-screen bg-[#f8f9fc] text-neutral-900">

      {/* =====================================================
          NAVBAR
          Matches.tsx structure preserved.
          Issue Details only replaces the left navigation with
          a Back to matches action.
      ===================================================== */}

      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-4">

          {/* LEFT — RETURN TO MATCHES */}

          <button
            onClick={() => navigate("/matches")}
            className="flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-900"
          >
            <ArrowLeft size={17} />
            Back to matches
          </button>

          {/* RIGHT — SAME AS MATCHES.TSX */}

          <div className="flex items-center gap-4">

            {/* GITHUB STATUS */}

            <div className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600">
              <GitBranch size={14} />
              synced
            </div>

            {/* PROFILE */}

            <div
              ref={profileRef}
              className="relative"
            >
              <button
                onClick={() =>
                  setProfileOpen(
                    (previous) => !previous
                  )
                }
                className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-neutral-100"
                aria-label="Open profile menu"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600">
                  {user?.email
                    ?.charAt(0)
                    .toUpperCase() || "U"}
                </span>

                <ChevronDown
                  size={15}
                  className={`text-neutral-400 transition-transform ${
                    profileOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">

                  {/* USER */}

                  <div className="border-b border-neutral-100 px-4 py-3">
                    <p className="text-sm font-semibold text-neutral-900">
                      {user?.displayName ||
                        "MergeMate Developer"}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-neutral-500">
                      {user?.email}
                    </p>
                  </div>

                  {/* MENU */}

                  <div className="p-2">

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/profile");
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-700 transition hover:bg-neutral-50"
                    >
                      <User
                        size={16}
                        className="text-neutral-400"
                      />
                      View profile
                    </button>

                    <button
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-700 transition hover:bg-neutral-50"
                    >
                      <Bookmark
                        size={16}
                        className="text-neutral-400"
                      />
                      Saved issues
                    </button>

                    <button
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-700 transition hover:bg-neutral-50"
                    >
                      <Settings
                        size={16}
                        className="text-neutral-400"
                      />
                      Preferences
                    </button>

                    <button
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-700 transition hover:bg-neutral-50"
                    >
                      <HelpCircle
                        size={16}
                        className="text-neutral-400"
                      />
                      Help & feedback
                    </button>

                  </div>

                  {/* SIGN OUT */}

                  <div className="border-t border-neutral-100 p-2">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mx-auto max-w-[1200px] px-8 py-10">

        {/* ===================================================
            REPOSITORY
        =================================================== */}

        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <GitBranch size={16} />

          <span>
            {issue.repository}
          </span>

          <span className="text-neutral-300">
            /
          </span>

          <span className="text-neutral-400">
            Issue
          </span>
        </div>

        {/* ===================================================
            TITLE
        =================================================== */}

        <div className="mt-5 flex items-start justify-between gap-10">

          <div className="min-w-0 flex-1">

            <h1 className="text-[34px] font-bold leading-tight tracking-[-1px]">
              {issue.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-neutral-500">

              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                {issue.state}
              </span>

              <span className="text-neutral-300">
                •
              </span>

              <span className="flex items-center gap-2">
                <Clock3 size={15} />
                Updated{" "}
                {new Date(
                  issue.updated_at
                ).toLocaleDateString()}
              </span>

            </div>
          </div>

          {/* GITHUB BUTTON */}

          <a
            href={issue.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Open on GitHub
            <ExternalLink size={16} />
          </a>

        </div>

        {/* ===================================================
            LABELS
        =================================================== */}

        {issue.labels.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">

            {issue.labels.map((label, index) => (
              <span
                key={`${label}-${index}`}
                className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600"
              >
                {label}
              </span>
            ))}

          </div>
        )}

        {/* ===================================================
            MATCH SUMMARY
        =================================================== */}

        <section className="mt-10 rounded-2xl border border-blue-200 bg-blue-50/60 p-6">

          <div className="flex items-start justify-between gap-6">

            <div>

              <div className="flex items-center gap-2">
                <Target
                  size={19}
                  className="text-blue-600"
                />

                <h2 className="text-lg font-bold">
                  Why MergeMate recommended this
                </h2>
              </div>

              <p className="mt-3 max-w-3xl text-[15px] leading-6 text-neutral-600">
                {match.reason}
              </p>

            </div>

            <div className="shrink-0 rounded-xl bg-white px-5 py-3 text-center shadow-sm">

              <div className="text-3xl font-bold text-blue-600">
                {match.relevance_score}%
              </div>

              <div className="mt-1 text-xs font-medium text-neutral-500">
                match
              </div>

            </div>

          </div>

          {/* MATCH METADATA */}

          <div className="mt-6 grid gap-3 sm:grid-cols-4">

            <MatchStat
              label="Difficulty"
              value={match.difficulty_fit}
            />

            <MatchStat
              label="Stack fit"
              value={match.stack_fit}
            />

            <MatchStat
              label="Beginner suitable"
              value={
                match.beginner_suitable
                  ? "Yes"
                  : "No"
              }
            />

            <MatchStat
              label="Scope"
              value={match.scope}
            />

          </div>

        </section>

        {/* ===================================================
            MAIN GRID
        =================================================== */}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_350px]">

          {/* =================================================
              ISSUE DESCRIPTION
          ================================================= */}

          <section className="rounded-2xl border border-neutral-200 bg-white">

            <div className="border-b border-neutral-200 px-7 py-5">

              <div className="flex items-center gap-2">

                <Code2
                  size={19}
                  className="text-neutral-500"
                />

                <h2 className="text-lg font-bold">
                  Issue description
                </h2>

              </div>

            </div>

            <div className="px-7 py-7">

              {issue.description ? (
                <div className="whitespace-pre-wrap text-[15px] leading-7 text-neutral-700">
                  {issue.description}
                </div>
              ) : (
                <p className="text-sm text-neutral-400">
                  This issue does not contain a description.
                </p>
              )}

            </div>

          </section>

          {/* =================================================
              LEARNING VALUE
          ================================================= */}

          <aside className="space-y-5">

            <section className="rounded-2xl border border-neutral-200 bg-white p-6">

              <div className="flex items-center gap-2">

                <BookOpen
                  size={18}
                  className="text-blue-600"
                />

                <h2 className="font-bold">
                  What you'll learn
                </h2>

              </div>

              <p className="mt-4 text-sm leading-6 text-neutral-600">
                {match.learning_value}
              </p>

            </section>

            {/* CONTRIBUTION CHECK */}

            <section className="rounded-2xl border border-neutral-200 bg-white p-6">

              <div className="flex items-center gap-2">

                <CheckCircle2
                  size={18}
                  className="text-green-600"
                />

                <h2 className="font-bold">
                  Contribution check
                </h2>

              </div>

              <div className="mt-5 space-y-3">

                <CheckRow
                  label="Relevant to your focus"
                  checked={match.relevance_score >= 60}
                />

                <CheckRow
                  label="Fits your technical stack"
                  checked={
                    match.stack_fit === "high" ||
                    match.stack_fit === "medium"
                  }
                />

                <CheckRow
                  label="Reasonable issue scope"
                  checked={
                    match.scope === "small" ||
                    match.scope === "medium"
                  }
                />

              </div>

            </section>

          </aside>

        </div>

        {/* ===================================================
            AI KICKSTART GUIDE
        =================================================== */}

        <KickstartSection
          issue={issue}
          user={user}
          kickstart={kickstart}
          isGenerating={isGenerating}
          error={kickstartError}
          onGenerated={setKickstart}
          onLoading={setIsGenerating}
          onError={setKickstartError}
        />

      </div>
    </main>
  );
}

/* ============================================================
   AI KICKSTART GUIDE
============================================================ */

function KickstartSection({
  issue,
  user,
  kickstart,
  isGenerating,
  error,
  onGenerated,
  onLoading,
  onError,
}: {
  issue: Issue;
  user: ReturnType<typeof useAuth>["user"];
  kickstart: KickstartResponse | null;
  isGenerating: boolean;
  error: string;
  onGenerated: (result: KickstartResponse) => void;
  onLoading: (loading: boolean) => void;
  onError: (message: string) => void;
}) {
  async function generateGuide() {
    if (!user) {
      onError("You must be signed in to generate a guide.");
      return;
    }

    onError("");
    onLoading(true);

    try {
      const idToken = await user.getIdToken();

      const matchesResultRaw =
        sessionStorage.getItem("matchesResult");

      const skillGapResultRaw =
        sessionStorage.getItem("skillGapResult");

      let matchesResult: any = null;
      let skillGapResult: any = null;

      try {
        matchesResult = matchesResultRaw
          ? JSON.parse(matchesResultRaw)
          : null;
      } catch {
        matchesResult = null;
      }

      try {
        skillGapResult = skillGapResultRaw
          ? JSON.parse(skillGapResultRaw)
          : null;
      } catch {
        skillGapResult = null;
      }

      const focusSkill =
        matchesResult?.focus_skill ||
        sessionStorage.getItem("focusSkill") ||
        "Not specified";

      const rawKnownSkills =
        skillGapResult?.current_skills ||
        skillGapResult?.known_skills ||
        [];

      /*
       * The skill-gap response can contain either:
       *
       * ["Python", "JavaScript"]
       *
       * or:
       *
       * [
       *   { name: "Python", level: "basic", evidence: "..." },
       *   { name: "JavaScript", level: "basic", evidence: "..." }
       * ]
       *
       * The Kickstart API expects list[str], so normalize both
       * shapes before sending the request.
       */
      const knownSkills = Array.isArray(rawKnownSkills)
        ? rawKnownSkills
            .map((skill: any) => {
              if (typeof skill === "string") {
                return skill;
              }

              if (
                skill &&
                typeof skill.name === "string"
              ) {
                return skill.name;
              }

              return null;
            })
            .filter(
              (skill: string | null): skill is string =>
                Boolean(skill)
            )
        : [];

      const experience =
        skillGapResult?.experience ||
        sessionStorage.getItem("experience") ||
        "beginner";

      const contributions =
        skillGapResult?.contributions ||
        sessionStorage.getItem("contributions") ||
        "none";

      const targetRole =
        skillGapResult?.target_role ||
        sessionStorage.getItem("targetRole") ||
        "";

      console.log(
        "========== KICKSTART REQUEST =========="
      );

      console.log("Focus skill:", focusSkill);
      console.log("Known skills:", knownSkills);
      console.log("Experience:", experience);
      console.log("Contributions:", contributions);
      console.log("Target role:", targetRole);
      console.log("Issue:", issue.repository, issue.title);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai/kickstart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            issue: {
              repository: issue.repository,
              title: issue.title,
              description: issue.description,
              labels: issue.labels,
            },
            developer: {
              focus_skill: focusSkill,
              known_skills: Array.isArray(knownSkills)
                ? knownSkills
                : [],
              experience,
              contributions,
              target_role: targetRole,
            },
          }),
        }
      );

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        let message =
          "Failed to generate the Kickstart Guide.";

        if (typeof data?.detail === "string") {
          message = data.detail;
        } else if (Array.isArray(data?.detail)) {
          /*
           * FastAPI validation errors are normally returned as:
           *
           * [
           *   {
           *     "loc": [...],
           *     "msg": "...",
           *     "type": "..."
           *   }
           * ]
           *
           * Do not let JavaScript render these objects as
           * "[object Object]".
           */
          const messages = data.detail
            .map((item: any) => {
              if (typeof item === "string") {
                return item;
              }

              if (item?.msg) {
                const location = Array.isArray(item.loc)
                  ? item.loc.join(".")
                  : "";

                return location
                  ? `${location}: ${item.msg}`
                  : item.msg;
              }

              return null;
            })
            .filter(
              (item: string | null): item is string =>
                Boolean(item)
            );

          if (messages.length > 0) {
            message = messages.join(" • ");
          }
        }

        throw new Error(message);
      }

      onGenerated(data);
    } catch (err) {
      console.error(
        "Kickstart guide failed:",
        err
      );

      onError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating the guide."
      );
    } finally {
      onLoading(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-7">

      {!kickstart && !isGenerating && (
        <>
          <div className="flex items-start justify-between gap-6">

            <div>
              <div className="flex items-center gap-2">
                <Target
                  size={19}
                  className="text-blue-600"
                />

                <h2 className="text-xl font-bold">
                  AI Kickstart Guide
                </h2>
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
                Get a practical starting plan for this issue
                before you write your first line of code.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
              AI assisted
            </span>

          </div>

          {error && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0"
              />

              <span>{error}</span>
            </div>
          )}

          <button
            onClick={generateGuide}
            className="mt-6 flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Target size={16} />
            Generate Kickstart Guide
          </button>
        </>
      )}

      {isGenerating && (
        <div className="py-8 text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
            <Loader2
              size={24}
              className="animate-spin text-blue-600"
            />
          </div>

          <h3 className="mt-5 text-lg font-bold">
            Building your starting plan
          </h3>

          <p className="mt-2 text-sm text-neutral-500">
            MergeMate is turning this issue into practical
            contribution steps.
          </p>

          <div className="mx-auto mt-6 max-w-md space-y-2 text-left">

            <div className="flex items-center gap-3 rounded-lg bg-neutral-50 px-4 py-3">
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
              <span className="text-sm text-neutral-600">
                Understanding the issue
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-neutral-50 px-4 py-3">
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
              <span className="text-sm text-neutral-600">
                Identifying what you need to know
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-neutral-50 px-4 py-3">
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
              <span className="text-sm text-neutral-600">
                Building your implementation plan
              </span>
            </div>

          </div>
        </div>
      )}

      {kickstart && !isGenerating && (
        <>

          <div className="flex items-start justify-between gap-6">

            <div>
              <div className="flex items-center gap-2">
                <Target
                  size={19}
                  className="text-blue-600"
                />

                <h2 className="text-xl font-bold">
                  AI Kickstart Guide
                </h2>
              </div>

              <p className="mt-2 text-sm text-neutral-500">
                Your personalized starting plan for this issue.
              </p>
            </div>

            <button
              onClick={generateGuide}
              className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
            >
              <RefreshCw size={15} />
              Regenerate
            </button>

          </div>

          <div className="mt-7 rounded-xl border border-blue-100 bg-blue-50/60 p-5">

            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
              What this issue is asking
            </p>

            <p className="mt-2 text-[15px] leading-6 text-neutral-700">
              {kickstart.issue_summary}
            </p>

          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">

            <GuideList
              title="What you need to know"
              icon={<BookOpen size={18} />}
              items={kickstart.what_you_need_to_know}
            />

            <GuideList
              title="Where to start"
              icon={<Target size={18} />}
              items={kickstart.where_to_start}
              numbered
            />

          </div>

          <div className="mt-6">
            <GuideList
              title="Implementation plan"
              icon={<Code2 size={18} />}
              items={kickstart.implementation_steps}
              numbered
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">

            <GuideList
              title="How to verify"
              icon={<CheckCircle2 size={18} />}
              items={kickstart.verification_steps}
            />

            <GuideList
              title="Definition of done"
              icon={<CheckCircle2 size={18} />}
              items={kickstart.definition_of_done}
            />

          </div>

        </>
      )}

    </section>
  );
}


/* ============================================================
   GUIDE LIST
============================================================ */

function GuideList({
  title,
  icon,
  items,
  numbered = false,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  numbered?: boolean;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">

      <div className="flex items-center gap-2">

        <span className="text-blue-600">
          {icon}
        </span>

        <h3 className="font-bold">
          {title}
        </h3>

      </div>

      <div className="mt-4 space-y-3">

        {items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={`${title}-${index}`}
              className="flex items-start gap-3"
            >

              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-blue-600 ring-1 ring-neutral-200">
                {numbered ? index + 1 : "✓"}
              </span>

              <p className="text-sm leading-6 text-neutral-600">
                {item}
              </p>

            </div>
          ))
        ) : (
          <p className="text-sm text-neutral-400">
            No guidance was returned for this section.
          </p>
        )}

      </div>
    </div>
  );
}


/* ============================================================
   MATCH STAT
============================================================ */

function MatchStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-blue-100 bg-white px-4 py-3">

      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold capitalize text-neutral-800">
        {value}
      </p>

    </div>
  );
}

/* ============================================================
   CHECK ROW
============================================================ */

function CheckRow({
  label,
  checked,
}: {
  label: string;
  checked: boolean;
}) {
  return (
    <div className="flex items-center gap-3">

      <CheckCircle2
        size={16}
        className={
          checked
            ? "text-green-500"
            : "text-neutral-300"
        }
      />

      <span className="text-sm text-neutral-600">
        {label}
      </span>

    </div>
  );
}

/* ============================================================
   GUIDE ITEM
============================================================ */
