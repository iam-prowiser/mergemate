import { useEffect, useRef, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  X,
  GitBranch,
  User,
  Settings,
  Bookmark,
  HelpCircle,
  LogOut,
  Check,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { logout } from "../firebase/authService";
import { useNavigate } from "react-router-dom";

/* ============================================================
   TYPES
============================================================ */

type SkillGap = {
  skill: string;
  priority?: string;
  reason?: string;
};

type CurrentSkill = {
  name: string;
  level?: string;
  evidence?: string;
};

type SkillGapResult = {
  target_role?: string;
  current_skills?: CurrentSkill[];
  skill_gaps?: SkillGap[];
  profile_summary?: string;
  career_path?: unknown[];
  recommendations?: unknown[];
};

type SearchStage = {
  title: string;
  description: string;
};

/* ============================================================
   COMPONENT
============================================================ */

export default function Explore() {
  const { user } = useAuth();
  const navigate = useNavigate();

  /* ==========================================================
     PROFILE DATA
  ========================================================== */

  const [skillGapResult, setSkillGapResult] =
    useState<SkillGapResult | null>(null);

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  /* ==========================================================
     SEARCH STATE
  ========================================================== */

  const [focusSkill, setFocusSkill] = useState("");
  const [searchMode, setSearchMode] =
    useState<"existing" | "developing">("existing");

  const [isSearching, setIsSearching] =
    useState(false);

  const [searchStage, setSearchStage] =
    useState(0);

  const [error, setError] = useState("");

  /* ==========================================================
     DROPDOWN STATE
  ========================================================== */

  const [skillOpen, setSkillOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef =
    useRef<HTMLDivElement>(null);

  /* ==========================================================
     LOAD SKILL-GAP RESULT
  ========================================================== */

  useEffect(() => {
    try {
      const stored =
        sessionStorage.getItem("skillGapResult");

      if (!stored) {
        console.warn(
          "No skill-gap result found in sessionStorage."
        );

        setLoadingProfile(false);
        return;
      }

      const parsed =
        JSON.parse(stored) as SkillGapResult;

      

      setSkillGapResult(parsed);

      /*
       * Default selection:
       *
       * Existing skill mode:
       * choose the first known skill.
       *
       * Developing mode:
       * choose the first identified skill gap.
       */

      const firstCurrentSkill =
        parsed.current_skills?.[0]?.name;

      const firstSkillGap =
        parsed.skill_gaps?.[0]?.skill;

      if (firstCurrentSkill) {
        setFocusSkill(firstCurrentSkill);
      } else if (firstSkillGap) {
        setFocusSkill(firstSkillGap);
        setSearchMode("developing");
      }
    } catch (error) {
      
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  /* ==========================================================
     CLOSE PROFILE DROPDOWN
  ========================================================== */

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
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

  /* ==========================================================
     SEARCH STAGE ANIMATION
     
     NOTE:
     These are UI progress stages.
     They do NOT pretend to know the exact backend
     execution timing.
  ========================================================== */

  useEffect(() => {
    if (!isSearching) {
      setSearchStage(0);
      return;
    }

    const timers = [
      window.setTimeout(
        () => setSearchStage(1),
        1800
      ),

      window.setTimeout(
        () => setSearchStage(2),
        4000
      ),

      window.setTimeout(
        () => setSearchStage(3),
        6500
      ),
    ];

    return () => {
      timers.forEach((timer) =>
        window.clearTimeout(timer)
      );
    };
  }, [isSearching]);

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
      
    }
  }

  /* ==========================================================
     AVAILABLE SKILLS
  ========================================================== */

  const existingSkills =
    skillGapResult?.current_skills
      ?.map((skill) => skill.name)
      .filter(Boolean) || [];

  const developingSkills =
    skillGapResult?.skill_gaps
      ?.map((gap) => gap.skill)
      .filter(Boolean) || [];

  const availableSkills =
    searchMode === "existing"
      ? existingSkills
      : developingSkills;

  /* ==========================================================
     CHANGE SEARCH MODE
  ========================================================== */

  function handleModeChange(
    mode: "existing" | "developing"
  ) {
    setSearchMode(mode);
    setSkillOpen(false);
    setError("");

    const skills =
      mode === "existing"
        ? existingSkills
        : developingSkills;

    setFocusSkill(skills[0] || "");
  }

  /* ==========================================================
     SEARCH
  ========================================================== */

  async function handleSearch() {
    if (!user) {
      setError(
        "You must be signed in to search for issues."
      );
      return;
    }

    if (!focusSkill) {
      setError(
        "Please select one skill before searching."
      );
      return;
    }

    setError("");
    setIsSearching(true);
    setSearchStage(0);

    try {
      /*
       * ======================================================
       * GET FIREBASE AUTH TOKEN
       * ======================================================
       */

      const idToken =
        await user.getIdToken();

      /*
       * ======================================================
       * GET USER PROFILE CONTEXT
       * ======================================================
       *
       * We intentionally send:
       *
       * - selected skill
       * - broader known stack
       * - experience
       * - contributions
       * - target role
       *
       * This is one of our locked product rules.
       */

      const knownSkills =
        skillGapResult?.current_skills
          ?.map((skill) => skill.name)
          .filter(Boolean) || [];

      const experience =
        sessionStorage.getItem(
          "experience"
        ) || "beginner";

      const contributions =
        sessionStorage.getItem(
          "contributions"
        ) || "none";

      const targetRole =
        skillGapResult?.target_role || "";

      const payload = {
        focus_skill: focusSkill,
        known_skills: knownSkills,
        experience,
        contributions,
        target_role: targetRole,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/github/search`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },

          body: JSON.stringify(payload),
        }
      );

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }


      /*
       * ======================================================
       * HANDLE ERROR
       * ======================================================
       */

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to find matching issues. Please try again."
        );
      }

      /*
       * ======================================================
       * STORE SEARCH RESULT
       * ======================================================
       *
       * Matches page will consume this.
       */

      sessionStorage.setItem(
        "matchesResult",
        JSON.stringify(data)
      );

      /*
       * Also store the search request so the Matches
       * page knows what produced these results.
       */

      sessionStorage.setItem(
        "matchesSearchRequest",
        JSON.stringify(payload)
      );


      /*
       * ======================================================
       * REDIRECT TO MATCHES
       * ======================================================
       */

      navigate("/matches");
    } catch (error) {
   

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while searching."
      );

      setIsSearching(false);
    }
  }

  /* ==========================================================
     LOADING PROFILE
  ========================================================== */

  if (loadingProfile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f9fc]">

        <div className="text-sm text-neutral-500">
          Loading your profile...
        </div>

      </main>
    );
  }

  /* ==========================================================
     SEARCH LOADING SCREEN
  ========================================================== */

  if (isSearching) {
    const stages: SearchStage[] = [
      {
        title:
          "Searching GitHub for real issues",
        description:
          "Finding real open-source issues related to your focus skill.",
      },
      {
        title:
          "Checking contribution requirements",
        description:
          "Filtering issues for realistic contribution opportunities.",
      },
      {
        title:
          "Evaluating relevance to your stack",
        description:
          "Matching issues against your skills and experience.",
      },
      {
        title:
          "Preparing personalized matches",
        description:
          "Ranking the best opportunities for you.",
      },
    ];

    return (
      <main className="min-h-screen bg-[#f8f9fc] text-neutral-900">

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="border-b border-neutral-200 bg-white">

          <div className="mx-auto flex max-w-[1400px] items-center px-8 py-4">

            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="flex items-center gap-2"
            >

              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">

                <GitBranch size={16} />

              </span>

              <span className="text-lg font-bold">
                MergeMate
              </span>

            </button>

          </div>

        </header>

        {/* ==================================================
            LOADING CARD
        ================================================== */}

        <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6">

          <div className="w-full max-w-[520px] rounded-2xl border border-neutral-200 bg-white px-9 py-10 shadow-sm">

            {/* SEARCH ICON */}

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">

              <Search
                size={27}
                className="text-blue-600"
              />

            </div>

            {/* TITLE */}

            <div className="mt-6 text-center">

              <h1 className="text-[25px] font-bold tracking-tight">
                Finding your opportunities
              </h1>

              <p className="mt-3 text-[15px] leading-6 text-neutral-500">

                MergeMate is searching for issues
                relevant to{" "}

                <span className="font-semibold text-neutral-800">
                  {focusSkill}
                </span>

                {" "}and your broader technical
                background.

              </p>

            </div>

            {/* =================================================
                STAGES
            ================================================= */}

            <div className="mt-8 space-y-2.5">

              {stages.map(
                (stage, index) => {

                  const isActive =
                    index === searchStage;

                  const isCompleted =
                    index < searchStage;

                  return (
                    <div
                      key={stage.title}
                      className={`
                        relative overflow-hidden
                        rounded-lg border
                        px-4 py-3.5
                        transition-all duration-700
                        ${
                          isActive
                            ? "border-blue-100 bg-blue-50/70 shadow-[0_0_0_1px_rgba(37,99,235,0.05)]"
                            : isCompleted
                            ? "border-neutral-100 bg-neutral-50"
                            : "border-neutral-100 bg-neutral-50/60"
                        }
                      `}
                    >

                      {/* ACTIVE BACKGROUND ANIMATION */}

                      {isActive && (
                        <div
                          className="
                            absolute inset-0
                            animate-pulse
                            bg-blue-100/30
                          "
                        />
                      )}

                      <div className="relative flex items-start gap-3">

                        {/* STATUS */}

                        <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center">

                          {isCompleted ? (

                            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">

                              <Check size={10} />

                            </div>

                          ) : isActive ? (

                            <div className="relative flex h-4 w-4 items-center justify-center">

                              <span className="absolute h-4 w-4 animate-ping rounded-full bg-blue-400 opacity-30" />

                              <span className="relative h-2 w-2 rounded-full bg-blue-600" />

                            </div>

                          ) : (

                            <span className="h-2 w-2 rounded-full bg-neutral-300" />

                          )}

                        </div>

                        {/* TEXT */}

                        <div className="min-w-0">

                          <p
                            className={`
                              text-sm font-semibold
                              transition-colors duration-500
                              ${
                                isActive
                                  ? "text-blue-700"
                                  : isCompleted
                                  ? "text-neutral-700"
                                  : "text-neutral-400"
                              }
                            `}
                          >
                            {stage.title}
                          </p>

                          <p
                            className={`
                              mt-1 text-xs
                              transition-colors duration-500
                              ${
                                isActive
                                  ? "text-blue-600/80"
                                  : isCompleted
                                  ? "text-neutral-500"
                                  : "text-neutral-400"
                              }
                            `}
                          >
                            {stage.description}
                          </p>

                        </div>

                        {/* ACTIVE DOTS */}

                        {isActive && (
                          <div className="ml-auto flex items-center gap-1 pt-1">

                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />

                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]" />

                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500" />

                          </div>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>

            {/* FOOTER */}

            <p className="mt-7 text-center text-xs text-neutral-400">
              This may take a few seconds.
            </p>

          </div>

        </div>

      </main>
    );
  }

  /* ==========================================================
     MAIN EXPLORE PAGE
  ========================================================== */

  return (
    <main className="min-h-screen bg-[#f8f9fc] text-neutral-900">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="border-b border-neutral-200 bg-white">

        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-4">

          {/* LEFT */}

          <div className="flex items-center gap-10">

            {/* LOGO */}

            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="flex items-center gap-2"
            >

              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">

                <GitBranch size={16} />

              </span>

              <span className="text-lg font-bold">
                MergeMate
              </span>

            </button>

            {/* NAVIGATION */}

            <nav className="flex items-center gap-8 text-[15px] font-medium text-neutral-500">

              <button
                onClick={() =>
                  navigate("/dashboard")
                }
                className="hover:text-neutral-900"
              >
                Dashboard
              </button>

              <button
                className="border-b-2 border-blue-600 pb-4 -mb-4 text-blue-600"
              >
                Explore
              </button>

              <button
                onClick={() =>
                  navigate("/matches")
                }
                className="hover:text-neutral-900"
              >
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

            <div
              ref={profileRef}
              className="relative"
            >

              <button
                onClick={() =>
                  setProfileOpen(
                    (prev) => !prev
                  )
                }
                className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-neutral-100"
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

              {/* PROFILE MENU */}

              {profileOpen && (
                <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">

                  <div className="border-b border-neutral-100 px-4 py-3">

                    <p className="text-sm font-semibold text-neutral-900">
                      {user?.displayName ||
                        "MergeMate Developer"}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-neutral-500">
                      {user?.email}
                    </p>

                  </div>

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
          PAGE
      ===================================================== */}

      <div className="mx-auto max-w-[1100px] px-8 py-12">

        {/* HEADER */}

        <section>

          <h1 className="text-[36px] font-bold tracking-[-1px]">
            Explore open-source issues
          </h1>

          <p className="mt-2 max-w-[700px] text-[18px] leading-7 text-neutral-500">

            Find a contribution opportunity based on
            what you already know — or use an issue
            to build a new skill.

          </p>

        </section>

        {/* ===================================================
            SEARCH CARD
        =================================================== */}

        <section className="mt-10 rounded-2xl border border-neutral-200 bg-white p-7">

          {/* STEP */}

          <p className="text-xs font-bold tracking-[0.12em] text-neutral-400">
            STEP 1
          </p>

          <h2 className="mt-3 text-[25px] font-bold tracking-tight">
            What do you want to work on?
          </h2>

          <p className="mt-2 text-sm text-neutral-500">
            Choose one skill. MergeMate will use it
            to find relevant open-source opportunities.
          </p>

          {/* =================================================
              MODE SELECTOR
          ================================================= */}

          <div className="mt-7 grid grid-cols-2 gap-4">

            {/* EXISTING SKILL */}

            <button
              type="button"
              onClick={() =>
                handleModeChange("existing")
              }
              className={`
                rounded-xl border p-5 text-left
                transition-all
                ${
                  searchMode === "existing"
                    ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                    : "border-neutral-200 hover:border-neutral-300"
                }
              `}
            >

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-3">

                  <div
                    className={`
                      flex h-10 w-10 items-center justify-center rounded-lg
                      ${
                        searchMode === "existing"
                          ? "bg-blue-600 text-white"
                          : "bg-neutral-100 text-neutral-500"
                      }
                    `}
                  >

                    <GitBranch size={18} />

                  </div>

                  <div>

                    <p className="text-sm font-semibold">
                      Use an existing skill
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      Work on issues related to
                      something you already know.
                    </p>

                  </div>

                </div>

                {searchMode === "existing" && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">

                    <Check size={12} />

                  </span>
                )}

              </div>

            </button>

            {/* DEVELOP SKILL */}

            <button
              type="button"
              onClick={() =>
                handleModeChange("developing")
              }
              className={`
                rounded-xl border p-5 text-left
                transition-all
                ${
                  searchMode === "developing"
                    ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                    : "border-neutral-200 hover:border-neutral-300"
                }
              `}
            >

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-3">

                  <div
                    className={`
                      flex h-10 w-10 items-center justify-center rounded-lg
                      ${
                        searchMode === "developing"
                          ? "bg-blue-600 text-white"
                          : "bg-neutral-100 text-neutral-500"
                      }
                    `}
                  >

                    <Search size={18} />

                  </div>

                  <div>

                    <p className="text-sm font-semibold">
                      Build a new skill
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      Turn one of your identified
                      skill gaps into a contribution
                      opportunity.
                    </p>

                  </div>

                </div>

                {searchMode === "developing" && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">

                    <Check size={12} />

                  </span>
                )}

              </div>

            </button>

          </div>

          {/* =================================================
              SKILL SELECTOR
          ================================================= */}

          <div className="mt-7">

            <label className="text-sm font-semibold text-neutral-700">

              {searchMode === "existing"
                ? "Choose a skill you already know"
                : "Choose a skill you want to develop"}

            </label>

            <div className="relative mt-2">

              <button
                type="button"
                onClick={() =>
                  setSkillOpen(
                    (prev) => !prev
                  )
                }
                disabled={
                  availableSkills.length === 0
                }
                className={`
                  flex w-full items-center justify-between
                  rounded-lg border
                  px-4 py-3
                  text-left text-sm
                  transition
                  ${
                    availableSkills.length === 0
                      ? "cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400"
                      : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300"
                  }
                `}
              >

                <span>
                  {focusSkill ||
                    "Select one skill"}
                </span>

                <ChevronDown
                  size={17}
                  className={`
                    text-neutral-400
                    transition-transform
                    ${
                      skillOpen
                        ? "rotate-180"
                        : ""
                    }
                  `}
                />

              </button>

              {/* DROPDOWN */}

              {skillOpen &&
                availableSkills.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-64 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg">

                    {availableSkills.map(
                      (skill) => (
                        <button
                          type="button"
                          key={skill}
                          onClick={() => {
                            setFocusSkill(
                              skill
                            );
                            setSkillOpen(
                              false
                            );
                          }}
                          className={`
                            flex w-full items-center justify-between
                            rounded-lg px-3 py-2.5
                            text-left text-sm
                            transition
                            ${
                              focusSkill ===
                              skill
                                ? "bg-blue-50 text-blue-700"
                                : "text-neutral-700 hover:bg-neutral-50"
                            }
                          `}
                        >

                          <span>
                            {skill}
                          </span>

                          {focusSkill ===
                            skill && (
                            <Check
                              size={15}
                              className="text-blue-600"
                            />
                          )}

                        </button>
                      )
                    )}

                  </div>
                )}

            </div>

            {/* NO SKILLS */}

            {availableSkills.length === 0 && (
              <div className="mt-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-4">

                <p className="text-sm font-medium text-neutral-700">
                  No skills available
                </p>

                <p className="mt-1 text-xs leading-5 text-neutral-500">

                  {searchMode === "existing"
                    ? "We couldn't find any skills in your profile."
                    : "We couldn't find any identified skill gaps. Complete your profile analysis first."}

                </p>

              </div>
            )}

          </div>

          {/* SELECTED SKILL */}

          {focusSkill && (
            <div className="mt-4 flex items-center gap-2">

              <span className="rounded-full border border-blue-500 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600">

                Focus skill: {focusSkill}

              </span>

              <button
                type="button"
                onClick={() =>
                  setFocusSkill("")
                }
                className="rounded-full p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
              >

                <X size={15} />

              </button>

            </div>
          )}

          {/* =================================================
              IMPORTANT PRODUCT MESSAGE
          ================================================= */}

          <div className="mt-6 rounded-lg bg-neutral-50 px-4 py-3">

            <p className="text-sm leading-6 text-neutral-500">

              MergeMate won't match issues using only
              this skill. We'll also consider your broader
              technical stack, experience, and contribution
              history to find opportunities you can
              realistically work on.

            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="mt-7 flex items-center justify-between border-t border-neutral-100 pt-6">

            <p className="text-sm text-neutral-400">
              We'll find real GitHub issues that fit
              your profile.
            </p>

            <button
              type="button"
              onClick={handleSearch}
              disabled={!focusSkill}
              className={`
                flex items-center gap-2
                rounded-lg px-5 py-2.5
                text-sm font-semibold
                transition
                ${
                  focusSkill
                    ? "bg-neutral-900 text-white hover:bg-neutral-800"
                    : "cursor-not-allowed bg-neutral-200 text-neutral-400"
                }
              `}
            >

              Search Issues

              <ChevronRight size={17} />

            </button>

          </div>

        </section>

        {/* ===================================================
            HOW IT WORKS
        =================================================== */}

        <section className="mt-7 grid grid-cols-3 gap-4">

          <InfoCard
            number="01"
            title="Choose one skill"
            description="Tell MergeMate whether you want to use an existing skill or develop a missing one."
          />

          <InfoCard
            number="02"
            title="We find real issues"
            description="MergeMate searches GitHub only after you explicitly start a search."
          />

          <InfoCard
            number="03"
            title="Get personalized matches"
            description="Candidates are evaluated against your selected skill and broader technical background."
          />

        </section>

      </div>

    </main>
  );
}

/* ============================================================
   INFO CARD
============================================================ */

function InfoCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">

      <p className="text-xs font-bold tracking-wider text-blue-600">
        {number}
      </p>

      <h3 className="mt-4 text-sm font-bold text-neutral-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-neutral-500">
        {description}
      </p>

    </div>
  );
}