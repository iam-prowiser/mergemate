import { useEffect, useMemo, useRef, useState } from "react";
import {
  GitBranch,
  ChevronDown,
  ChevronRight,
  User,
  Settings,
  Bookmark,
  HelpCircle,
  LogOut,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Tag,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { logout } from "../firebase/authService";
import { useNavigate } from "react-router-dom";

/* ============================================================
   TYPES
============================================================ */

type GitHubIssue = {
  id: number;
  repository: string;
  title: string;
  description: string;
  url: string;
  labels: string[];
  state: string;
  updated_at: string;
};

type NIMMatch = {
  issue_id: number;
  relevance_score: number;
  difficulty_fit: string;
  stack_fit: string;
  beginner_suitable: boolean;
  scope: string;
  evidence: string[];
  reason: string;
  learning_value: string;
  recommended: boolean;
};

type MatchesResponse = {
  focus_skill: string;
  total_candidates: number;
  matches: NIMMatch[];
  issues: GitHubIssue[];
};

type JoinedIssue = GitHubIssue & {
  match: NIMMatch;
};

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function Matches() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [result, setResult] = useState<MatchesResponse | null>(null);

  const [profileOpen, setProfileOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [savedIssues, setSavedIssues] = useState<number[]>([]);

  const profileRef = useRef<HTMLDivElement>(null);

  /* ==========================================================
     LOAD SEARCH RESULT
  ========================================================== */

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("matchesResult");

      if (!stored) {
        setError("No search results found. Start a search from Explore.");

        setLoading(false);
        return;
      }

      const parsed = JSON.parse(stored) as MatchesResponse;

      console.log("========== MATCHES RESULT ==========");

      console.log(parsed);

      console.log("====================================");

      setResult(parsed);
    } catch (error) {
      console.error("Failed to load matches:", error);

      setError("We couldn't load your matches.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ==========================================================
     CLOSE PROFILE DROPDOWN
  ========================================================== */

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* ==========================================================
     JOIN RECOMMENDED MATCHES WITH GITHUB ISSUES
  ========================================================== */

  const recommendedIssues = useMemo<JoinedIssue[]>(() => {
    if (!result) {
      return [];
    }

    const issueMap = new Map<number, GitHubIssue>();

    for (const issue of result.issues) {
      issueMap.set(issue.id, issue);
    }

    return result.matches
      .filter((match) => match.recommended)
      .map((match) => {
        const issue = issueMap.get(match.issue_id);

        if (!issue) {
          return null;
        }

        return {
          ...issue,
          match,
        };
      })
      .filter((issue): issue is JoinedIssue => issue !== null)
      .sort((a, b) => b.match.relevance_score - a.match.relevance_score);
  }, [result]);

  /* ==========================================================
     OTHER CANDIDATES
     
     These are GitHub candidates that were evaluated
     but were NOT recommended by NIM.
  ========================================================== */

  const otherCandidates = useMemo<GitHubIssue[]>(() => {
    if (!result) {
      return [];
    }

    const recommendedIds = new Set(
      result.matches
        .filter((match) => match.recommended)
        .map((match) => match.issue_id),
    );

    return result.issues.filter((issue) => !recommendedIds.has(issue.id));
  }, [result]);

  /* ==========================================================
     GET NIM EVALUATION FOR OTHER CANDIDATES
     
     This lets us optionally show why an issue wasn't
     recommended when NIM actually evaluated it.
  ========================================================== */

  const matchByIssueId = useMemo(() => {
    const map = new Map<number, NIMMatch>();

    if (!result) {
      return map;
    }

    for (const match of result.matches) {
      map.set(match.issue_id, match);
    }

    return map;
  }, [result]);

  /* ==========================================================
     LOGOUT
  ========================================================== */

  async function handleLogout() {
    try {
      setProfileOpen(false);

      await logout();

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  /* ==========================================================
     SAVE ISSUE
     
     Temporary frontend-only behavior.
     Database persistence comes later.
  ========================================================== */

  function toggleSave(issueId: number) {
    setSavedIssues((current) => {
      if (current.includes(issueId)) {
        return current.filter((id) => id !== issueId);
      }

      return [...current, issueId];
    });
  }

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f9fc]">
        <div className="text-sm text-neutral-500">Loading your matches...</div>
      </main>
    );
  }

  /* ==========================================================
     NAVBAR
  ========================================================== */

  const navbar = (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-4">
        {/* LEFT */}

        <div className="flex items-center gap-10">
          {/* LOGO */}

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <GitBranch size={16} />
            </span>

            <span className="text-lg font-bold">MergeMate</span>
          </button>

          {/* NAVIGATION */}

          <nav className="flex items-center gap-8 text-[15px] font-medium text-neutral-500">
            <button
              onClick={() => navigate("/dashboard")}
              className="hover:text-neutral-900"
            >
              Dashboard
            </button>

            <button
              onClick={() => navigate("/opportunities")}
              className="hover:text-neutral-900"
            >
              Explore
            </button>

            <button className="border-b-2 border-blue-600 pb-4 -mb-4 text-blue-600">
              Matches
            </button>
          </nav>
        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-4">
          {/* GITHUB STATUS */}

          <div className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600">
            <GitBranch size={14} />
            synced
          </div>

          {/* PROFILE */}

          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen((previous) => !previous)}
              className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-neutral-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </span>

              <ChevronDown
                size={15}
                className={`text-neutral-400 transition-transform ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
                {/* USER */}

                <div className="border-b border-neutral-100 px-4 py-3">
                  <p className="text-sm font-semibold text-neutral-900">
                    {user?.displayName || "MergeMate Developer"}
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
                    <User size={16} className="text-neutral-400" />
                    View profile
                  </button>

                  <button
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-700 transition hover:bg-neutral-50"
                  >
                    <Bookmark size={16} className="text-neutral-400" />
                    Saved issues
                  </button>

                  <button
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-700 transition hover:bg-neutral-50"
                  >
                    <Settings size={16} className="text-neutral-400" />
                    Preferences
                  </button>

                  <button
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-700 transition hover:bg-neutral-50"
                  >
                    <HelpCircle size={16} className="text-neutral-400" />
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
  );

  /* ==========================================================
     NO RESULT
  ========================================================== */

  if (!result || error) {
    return (
      <main className="min-h-screen bg-[#f8f9fc] text-neutral-900">
        {navbar}

        <div className="mx-auto max-w-[900px] px-8 py-20">
          <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
              <AlertCircle size={26} className="text-neutral-500" />
            </div>

            <h1 className="mt-5 text-2xl font-bold">No matches yet</h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
              {error ||
                "Start a search from Explore to find contribution opportunities."}
            </p>

            <button
              onClick={() => navigate("/opportunities")}
              className="mt-7 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Explore Issues
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* ==========================================================
     MAIN PAGE
  ========================================================== */

  return (
    <main className="min-h-screen bg-[#f8f9fc] text-neutral-900">
      {navbar}

      <div className="mx-auto max-w-[1400px] px-8 py-10">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <section>
          <div className="flex items-end justify-between gap-8">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Personalized search results
              </p>

              <h1 className="mt-2 text-[36px] font-bold tracking-[-1px]">
                Matches for you
              </h1>

              <p className="mt-2 text-[18px] text-neutral-500">
                Opportunities matched to{" "}
                <span className="font-semibold text-neutral-700">
                  {result.focus_skill}
                </span>{" "}
                and your broader technical profile.
              </p>
            </div>

            {/* SEARCH AGAIN */}

            <button
              onClick={() => navigate("/opportunities")}
              className="shrink-0 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
            >
              Search again
            </button>
          </div>
        </section>

        {/* ====================================================
            SUMMARY
        ==================================================== */}

        <section className="mt-8 grid grid-cols-3 gap-4">
          <SummaryCard label="Focus skill" value={result.focus_skill} />

          <SummaryCard
            label="GitHub candidates"
            value={String(result.total_candidates)}
          />

          <SummaryCard
            label="Recommended"
            value={String(recommendedIssues.length)}
          />
        </section>

        {/* ====================================================
            EXPLANATION
        ==================================================== */}

        <div className="mt-8 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-5 py-4">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-blue-600" />

          <div>
            <p className="text-sm font-semibold text-blue-800">
              These aren't just {result.focus_skill} keyword matches.
            </p>

            <p className="mt-1 text-sm leading-6 text-blue-700/80">
              MergeMate evaluates each candidate against your technical
              background, experience, contribution history, and the skill you're
              trying to develop.
            </p>
          </div>
        </div>

        {/* ====================================================
            RECOMMENDED MATCHES
        ==================================================== */}

        {recommendedIssues.length > 0 && (
          <section className="mt-10">
            <div className="mb-5">
              <h2 className="text-[21px] font-bold">
                Recommended opportunities
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Issues that passed MergeMate's relevance and difficulty checks.
              </p>
            </div>

            <div className="space-y-4">
              {recommendedIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  saved={savedIssues.includes(issue.id)}
                  onToggleSave={() => toggleSave(issue.id)}
                  onViewIssue={() => {
                    sessionStorage.setItem(
                      "selectedIssue",
                      JSON.stringify({
                        issue: {
                          id: issue.id,
                          repository: issue.repository,
                          title: issue.title,
                          description: issue.description,
                          url: issue.url,
                          labels: issue.labels,
                          state: issue.state,
                          updated_at: issue.updated_at,
                        },
                        match: issue.match,
                      }),
                    );

                    navigate(`/issue/${issue.id}`);
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* ====================================================
            OTHER CANDIDATES
        ==================================================== */}

        {otherCandidates.length > 0 && (
          <section className="mt-14">
            <div className="mb-5">
              <div className="flex items-center gap-3">
                <h2 className="text-[21px] font-bold">
                  Other candidates we evaluated
                </h2>

                <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-500">
                  {otherCandidates.length}
                </span>
              </div>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-500">
                These issues were returned by GitHub during your search but
                weren't strong enough to be recommended for you.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              {otherCandidates.map((issue, index) => {
                const evaluation = matchByIssueId.get(issue.id);

                return (
                  <CandidateRow
                    key={issue.id}
                    issue={issue}
                    evaluation={evaluation}
                    last={index === otherCandidates.length - 1}
                  />
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}

/* ============================================================
   RECOMMENDED ISSUE CARD
============================================================ */

function IssueCard({
  issue,
  saved,
  onToggleSave,
  onViewIssue,
}: {
  issue: JoinedIssue;
  saved: boolean;
  onToggleSave: () => void;
  onViewIssue: () => void;
}) {
  const score = issue.match.relevance_score;

  const scoreLabel =
    score >= 90
      ? "Excellent match"
      : score >= 80
        ? "Strong match"
        : "Good match";

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="p-6">
        {/* TOP */}

        <div className="flex items-start justify-between gap-8">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <GitBranch size={16} className="shrink-0 text-neutral-400" />

              <span className="text-sm font-medium text-neutral-500">
                {issue.repository}
              </span>
            </div>

            <h3 className="mt-2 text-[21px] font-bold leading-7 text-neutral-900">
              {issue.title}
            </h3>
          </div>

          {/* MATCH SCORE */}

          <div className="shrink-0 text-right">
            <div className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2">
              <CheckCircle2 size={16} className="text-green-600" />

              <span className="text-sm font-bold text-green-700">
                {score}% match
              </span>
            </div>

            <p className="mt-1 text-xs text-neutral-400">{scoreLabel}</p>
          </div>
        </div>

        {/* DESCRIPTION */}

        <p className="mt-4 line-clamp-3 text-sm leading-6 text-neutral-500">
          {issue.description}
        </p>

        {/* METADATA */}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <MetaBadge label={`Difficulty: ${issue.match.difficulty_fit}`} />

          <MetaBadge label={`Stack fit: ${issue.match.stack_fit}`} />

          {issue.match.beginner_suitable && (
            <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              Beginner suitable
            </span>
          )}

          {issue.match.scope && (
            <MetaBadge label={`Scope: ${issue.match.scope}`} />
          )}

          <span className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Clock3 size={13} />
            Updated {formatDate(issue.updated_at)}
          </span>
        </div>

        {/* LABELS */}

        {issue.labels.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {issue.labels.map((label) => (
              <span
                key={label}
                className="flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-600"
              >
                <Tag size={11} />

                {label}
              </span>
            ))}
          </div>
        )}

        {/* WHY */}

        <div className="mt-6 rounded-xl border border-neutral-100 bg-neutral-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">
            Why this matches
          </p>

          <p className="mt-2 text-sm leading-6 text-neutral-700">
            {issue.match.reason}
          </p>
        </div>

        {/* LEARNING */}

        {issue.match.learning_value && (
          <div className="mt-3 rounded-xl border border-neutral-100 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">
              What you'll learn
            </p>

            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {issue.match.learning_value}
            </p>
          </div>
        )}

        {/* ACTIONS */}

        <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-5">
          <button
            onClick={onToggleSave}
            className={`
              flex items-center gap-2
              rounded-lg px-3 py-2
              text-sm font-medium
              transition
              ${
                saved
                  ? "bg-blue-50 text-blue-700"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
              }
            `}
          >
            <Bookmark
              size={16}
              className={saved ? "fill-blue-600 text-blue-600" : ""}
            />

            {saved ? "Saved" : "Save issue"}
          </button>

          <button
            onClick={onViewIssue}
            className="flex items-center gap-1 text-[16px] font-semibold text-blue-600 transition hover:text-blue-700"
          >
            View issue
            <ChevronRight size={19} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   OTHER CANDIDATE ROW
============================================================ */

function CandidateRow({
  issue,
  evaluation,
  last,
}: {
  issue: GitHubIssue;
  evaluation?: NIMMatch;
  last: boolean;
}) {
  return (
    <article
      className={`px-6 py-5 ${!last ? "border-b border-neutral-200" : ""}`}
    >
      <div className="flex items-start justify-between gap-8">
        {/* LEFT */}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <GitBranch size={15} className="shrink-0 text-neutral-400" />

            <span className="text-sm font-medium text-neutral-500">
              {issue.repository}
            </span>
          </div>

          <h3 className="mt-1 text-[17px] font-semibold text-neutral-900">
            {issue.title}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-500">
            {issue.description}
          </p>

          {/* LABELS */}

          {issue.labels.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {issue.labels.map((label) => (
                <span
                  key={label}
                  className="rounded-md bg-neutral-100 px-2 py-1 text-xs text-neutral-500"
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* NIM REASON */}

          {evaluation?.reason && (
            <div className="mt-4 rounded-lg bg-neutral-50 px-3 py-2.5">
              <p className="text-xs text-neutral-500">
                <span className="font-semibold text-neutral-600">
                  Not recommended:
                </span>{" "}
                {evaluation.reason}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT */}

        <div className="flex shrink-0 flex-col items-end gap-3">
          {/* SCORE IF AVAILABLE */}

          {evaluation && (
            <span className="rounded-md bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500">
              {evaluation.relevance_score}% match
            </span>
          )}

          {!evaluation && (
            <span className="rounded-md bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500">
              Candidate
            </span>
          )}

          <a
            href={issue.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            View issue
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   META BADGE
============================================================ */

function MetaBadge({ label }: { label: string }) {
  return (
    <span className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
      {label}
    </span>
  );
}

/* ============================================================
   DATE FORMATTER
============================================================ */

function formatDate(value: string) {
  try {
    const date = new Date(value);

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return value;
  }
}
