import { useEffect, useState, useRef } from "react";
import {
  User,
  Settings,
  Bookmark,
  HelpCircle,
  LogOut,
  ChevronDown,
  GitBranch,
  ChevronRight,
  ArrowRight,
  Cpu,
  PieChart,
  Info,
  Database,
  Brain,
  Layers,
  Terminal,
  Sparkles,
  Shield,
  Hexagon,
  Award,
  Compass,
  Rocket,
  Target,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { logout } from "../firebase/authService";
import { useNavigate } from "react-router-dom";

/* =========================================================
   TYPES
========================================================= */

type CurrentSkill = {
  name?: string;
  skill?: string;
  level?: string;
  evidence?: string;
};

type SkillGap = {
  skill?: string;
  name?: string;
  priority?: string;
  reason?: string;
};

type CareerPathStage = {
  stage?: string;
  title?: string;
  skills?: unknown;
  technologies?: unknown;
  status?: string;
};

type SkillGapResult = {
  target_role?: string;
  profile_summary?: string;
  current_skills?: unknown;
  skill_gaps?: unknown;
  career_path?: unknown;
};

type PathStep = {
  title: string;
  subtitle: string;
  status: string;
  labelColor: string;
  boxBg: string;
  boxBorder: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
};

type SkillCard = {
  id: string;
  name: string;
  reason: string;
  priority: string;
  gapPercent: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  priorityBg: string;
  priorityColor: string;
  barColor: string;
  percentColor: string;
};

/* =========================================================
   SAFE HELPERS
========================================================= */

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0,
  );
}

function getStageSkills(stage: CareerPathStage): string[] {
  const skills = asStringArray(stage.skills);

  if (skills.length > 0) {
    return skills;
  }

  return asStringArray(stage.technologies);
}

function getStatus(stage: CareerPathStage): string {
  return typeof stage.status === "string"
    ? stage.status.toLowerCase().trim()
    : "";
}

function getSkillName(skill: CurrentSkill): string {
  return skill.name?.trim() || skill.skill?.trim() || "";
}

function getGapName(gap: SkillGap): string {
  return gap.skill?.trim() || gap.name?.trim() || "";
}

/* =========================================================
   ROLE
========================================================= */

function formatRole(role?: string): string {
  const roles: Record<string, string> = {
    frontend: "Frontend Developer",
    backend: "Backend Developer",
    fullstack: "Full Stack Developer",
    "ai-ml": "AI / ML Engineer",
    devops: "DevOps Engineer",
  };

  if (!role) return "Developer";

  return roles[role] ?? role;
}

/* =========================================================
   ICON
========================================================= */

function getSkillIcon(name: string) {
  const value = name.toLowerCase();

  if (
    value.includes("pytorch") ||
    value.includes("tensorflow") ||
    value.includes("machine learning") ||
    value.includes("deep learning")
  ) {
    return <Brain size={20} />;
  }

  if (
    value.includes("pandas") ||
    value.includes("numpy") ||
    value.includes("data")
  ) {
    return <Database size={20} />;
  }

  if (
    value.includes("api") ||
    value.includes("fastapi") ||
    value.includes("backend")
  ) {
    return <Terminal size={20} />;
  }

  if (
    value.includes("react") ||
    value.includes("frontend") ||
    value.includes("typescript")
  ) {
    return <Layers size={20} />;
  }

  if (value.includes("testing") || value.includes("jest")) {
    return <PieChart size={20} />;
  }

  return <Cpu size={20} />;
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function SkillGapDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [result, setResult] = useState<SkillGapResult | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

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

  /* =======================================================
     LOAD RESULT
  ======================================================= */

  useEffect(() => {
    const stored = sessionStorage.getItem("skillGapResult");

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored);

  

      setResult(parsed);
    } catch (error) {
     
    }
  }, []);

  /* =======================================================
     LOGOUT
  ======================================================= */

  async function handleLogout() {
  try {
    setProfileOpen(false);

    await logout();

    navigate("/login", { replace: true });
  } catch (error) {
   
  }
}

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  if (!result) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f9fc]">
        <div className="rounded-2xl border border-neutral-200 bg-white px-10 py-8 text-center shadow-sm">
          <h1 className="text-xl font-bold">No skill analysis found</h1>

          <p className="mt-2 text-sm text-neutral-500">
            Complete the questionnaire first.
          </p>

          <button
            onClick={() => navigate("/questionnaire")}
            className="mt-6 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white"
          >
            Go to Questionnaire
          </button>
        </div>
      </main>
    );
  }

  /* =======================================================
     NORMALIZE RESPONSE
  ======================================================= */

  const role = formatRole(result.target_role);

  const currentSkills: CurrentSkill[] = asArray(result.current_skills).filter(
    (item): item is CurrentSkill => typeof item === "object" && item !== null,
  );

  const skillGaps: SkillGap[] = asArray(result.skill_gaps).filter(
    (item): item is SkillGap => typeof item === "object" && item !== null,
  );

  const careerPath: CareerPathStage[] = asArray(result.career_path).filter(
    (item): item is CareerPathStage =>
      typeof item === "object" && item !== null,
  );

  /* =======================================================
     CURRENT SKILLS
  ======================================================= */

  const currentSkillNames = currentSkills.map(getSkillName).filter(Boolean);

  /* =======================================================
     CAREER PATH STAGES
  ======================================================= */

  const buildNextStage = careerPath.find((stage) => {
    const status = getStatus(stage);

    return status === "build_next" || status === "build next";
  });

  const keyGapStage = careerPath.find((stage) => {
    const status = getStatus(stage);

    return status === "key_gap" || status === "key gap";
  });

  const targetStage = careerPath.find((stage) => {
    const status = getStatus(stage);

    return status === "target_role" || status === "target role";
  });

  /* =======================================================
     BUILD NEXT
  ======================================================= */

  let buildNextSkills = buildNextStage ? getStageSkills(buildNextStage) : [];

  if (buildNextSkills.length === 0) {
    buildNextSkills = skillGaps
      .filter((gap) => gap.priority?.toLowerCase() === "high")
      .map(getGapName)
      .filter(Boolean)
      .slice(0, 3);
  }

  /* =======================================================
     KEY GAP
  ======================================================= */

  let keyGapSkills = keyGapStage ? getStageSkills(keyGapStage) : [];

  if (keyGapSkills.length === 0) {
    keyGapSkills = skillGaps
      .filter((gap) => gap.priority?.toLowerCase() === "medium")
      .map(getGapName)
      .filter(Boolean)
      .slice(0, 3);
  }

  /* =======================================================
     TARGET ROLE
  ======================================================= */

  const targetSkills = targetStage ? getStageSkills(targetStage) : [];

  /* =======================================================
     EXACTLY 4 ROADMAP STOPS
  ======================================================= */

  const pathSteps: PathStep[] = [
    {
      title: "Your Stack",
      subtitle:
        currentSkillNames.length > 0
          ? currentSkillNames.join(", ")
          : "No skills identified",
      status: "Strong foundation",
      labelColor: "text-green-600",
      boxBg: "bg-green-50",
      boxBorder: "border-green-200",
      iconBg: "bg-white",
      iconColor: "text-green-600",
      icon: <Terminal size={16} />,
    },

    {
      title: buildNextStage?.title || buildNextStage?.stage || "Build Next",
      subtitle:
        buildNextSkills.length > 0
          ? buildNextSkills.join(", ")
          : "Skills to develop",
      status: "Build next",
      labelColor: "text-blue-600",
      boxBg: "bg-blue-50",
      boxBorder: "border-blue-200",
      iconBg: "bg-white",
      iconColor: "text-blue-600",
      icon: <Layers size={16} />,
    },

    {
      title: keyGapStage?.title || keyGapStage?.stage || "Key Gap",
      subtitle:
        keyGapSkills.length > 0
          ? keyGapSkills.join(", ")
          : "Core skills to develop",
      status: "Key gap",
      labelColor: "text-red-600",
      boxBg: "bg-orange-50",
      boxBorder: "border-orange-200",
      iconBg: "bg-white",
      iconColor: "text-orange-600",
      icon: <Cpu size={16} />,
    },

    {
      title: role,
      subtitle:
        targetSkills.length > 0
          ? targetSkills.join(", ")
          : `Technologies for ${role}`,
      status: "Your target role",
      labelColor: "text-violet-600",
      boxBg: "bg-violet-50",
      boxBorder: "border-violet-200",
      iconBg: "bg-white",
      iconColor: "text-violet-600",
      icon: <Rocket size={16} />,
    },
  ];

  /* =======================================================
     SKILL GAP CARDS
  ======================================================= */

  const skillCards: SkillCard[] = skillGaps.slice(0, 4).map((gap, index) => {
    const name = getGapName(gap) || `Skill ${index + 1}`;

    const priority = gap.priority?.toLowerCase() || "medium";

    let iconBg = "bg-neutral-100";
    let iconColor = "text-neutral-500";
    let priorityBg = "bg-neutral-100";
    let priorityColor = "text-neutral-600";
    let barColor = "bg-neutral-400";
    let percentColor = "text-neutral-600";
    let gapPercent = 35;

    if (priority === "high") {
      iconBg = "bg-red-50";
      iconColor = "text-red-500";
      priorityBg = "bg-red-50";
      priorityColor = "text-red-600";
      barColor = "bg-red-600";
      percentColor = "text-red-600";
      gapPercent = 90;
    }

    if (priority === "medium") {
      iconBg = "bg-orange-50";
      iconColor = "text-orange-500";
      priorityBg = "bg-orange-50";
      priorityColor = "text-orange-600";
      barColor = "bg-orange-500";
      percentColor = "text-orange-600";
      gapPercent = 60;
    }

    return {
      id: `${name}-${index}`,
      name,
      reason: gap.reason || "Recommended for your target role.",
      priority,
      gapPercent,
      icon: getSkillIcon(name),
      iconBg,
      iconColor,
      priorityBg,
      priorityColor,
      barColor,
      percentColor,
    };
  });

  /* =======================================================
     REASONS
  ======================================================= */

  const reasons = [];

  if (currentSkillNames.length > 0) {
    reasons.push({
      number: 1,
      title: "Strong foundations detected",
      body: `Your current profile includes ${currentSkillNames
        .slice(0, 3)
        .join(", ")}.`,
    });
  }

  const highGap = skillGaps.find(
    (gap) => gap.priority?.toLowerCase() === "high",
  );

  if (highGap) {
    const name = getGapName(highGap);

    if (name) {
      reasons.push({
        number: 2,
        title: "High-priority skill gap",
        body: highGap.reason || `${name} is important for your target role.`,
      });
    }
  }

  const mediumGap = skillGaps.find(
    (gap) => gap.priority?.toLowerCase() === "medium",
  );

  if (mediumGap) {
    const name = getGapName(mediumGap);

    if (name) {
      reasons.push({
        number: 3,
        title: "Next development area",
        body: mediumGap.reason || `${name} will strengthen your profile.`,
      });
    }
  }

  /* =======================================================
     PATH NODES (boxes + connecting arrows)
  ======================================================= */

  const pathNodes: React.ReactNode[] = [];

  pathSteps.forEach((step, index) => {
    pathNodes.push(
      <div
        key={`step-${index}`}
        className={`flex min-w-0 flex-1 flex-col rounded-xl border ${step.boxBorder} ${step.boxBg} p-5`}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${step.iconBg} ${step.iconColor} shadow-sm`}
          >
            {step.icon}
          </span>

          <p className="min-w-0 truncate text-[15px] font-bold leading-snug text-neutral-900">
            {step.title}
          </p>
        </div>

        <p className="mt-3 flex-1 break-words text-sm leading-relaxed text-neutral-600">
          {step.subtitle}
        </p>

        <p className={`mt-4 text-sm font-semibold ${step.labelColor}`}>
          {step.status}
        </p>
      </div>,
    );

    if (index < pathSteps.length - 1) {
      pathNodes.push(
        <div
          key={`arrow-${index}`}
          className="hidden shrink-0 items-center justify-center text-neutral-300 md:flex"
        >
          <ArrowRight size={16} />
        </div>,
      );
    }
  });

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-neutral-900">
      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-4">
          <div className="flex items-center gap-10">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <GitBranch size={16} />
              </span>

              <span className="text-lg font-bold">MergeMate</span>
            </button>

            <nav className="flex items-center gap-8 text-[15px] font-medium text-neutral-500">
              <button
                onClick={() => navigate("/dashboard")}
                className="border-b-2 border-blue-600 pb-4 -mb-4 text-blue-600"
              >
                Dashboard
              </button>

              <button
                onClick={() => navigate("/opportunities")}
                className="hover:text-neutral-900"
              >
                Explore
              </button>

              <button
                onClick={() => navigate("/matches")}
                className="hover:text-neutral-900"
              >
                Matches
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600">
              <GitBranch size={14} />
              synced
            </div>

            <div ref={profileRef} className="relative">
              {/* Profile button */}
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
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

              {/* Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
                  {/* User */}
                  <div className="border-b border-neutral-100 px-4 py-3">
                    <p className="text-sm font-semibold text-neutral-900">
                      {user?.displayName || "MergeMate Developer"}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-neutral-500">
                      {user?.email}
                    </p>
                  </div>

                  {/* Menu */}
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
                      onClick={() => {
                        setProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-700 transition hover:bg-neutral-50"
                    >
                      <Bookmark size={16} className="text-neutral-400" />
                      Saved issues
                    </button>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-700 transition hover:bg-neutral-50"
                    >
                      <Settings size={16} className="text-neutral-400" />
                      Preferences
                    </button>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-700 transition hover:bg-neutral-50"
                    >
                      <HelpCircle size={16} className="text-neutral-400" />
                      Help & feedback
                    </button>
                  </div>

                  {/* Sign out */}
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

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-[1400px] px-8 py-10">
        {/* =================================================
            HERO
        ================================================= */}

        <div className="mb-10 flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-xl">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              <Compass size={14} />
              {role}
            </span>

            <h1 className="text-[34px] font-extrabold leading-tight tracking-tight">
              Your {role} skill gap
            </h1>

            <p className="mt-3 text-[15px] leading-relaxed text-neutral-500">
              Here&apos;s where you stand today — and what you need to
              strengthen to become a stronger candidate.
            </p>

            <p className="mt-4 flex items-center gap-1.5 text-sm text-neutral-400">
              <Info size={14} />
              Analysis generated from your resume + questionnaire
            </p>
          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="mt-8 grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Shield size={16} />
                </span>

                <p className="text-sm text-neutral-500">Current Skills</p>
              </div>

              <p className="mt-3 text-3xl font-bold">{currentSkills.length}</p>

              <p className="mt-1 text-xs text-neutral-400">Skills identified</p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                  <Hexagon size={16} />
                </span>

                <p className="text-sm text-neutral-500">To Develop</p>
              </div>

              <p className="mt-3 text-3xl font-bold text-red-600">
                {skillGaps.length}
              </p>

              <p className="mt-1 text-xs text-neutral-400">Priority areas</p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  <Award size={16} />
                </span>

                <p className="text-sm text-neutral-500">Target Role</p>
              </div>

              <p className="mt-3 max-w-[180px] text-xl font-bold leading-snug">
                {role}
              </p>

              <p className="mt-1 text-xs text-neutral-400">Career direction</p>
            </div>
          </div>
        </div>

        {/* =================================================
            SKILLS TO DEVELOP
        ================================================= */}

        <section className="mb-8">
          {result.profile_summary && (
            <div className="mb-8 rounded-xl border border-neutral-200 bg-white p-4">
              <p className="text-blue-500 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                AI Profile Summary <Sparkles size={14} />
              </p>

              <p className="mt-2 text-sm leading-6 text-neutral-600">
                {result.profile_summary}
              </p>
            </div>
          )}

          <h2 className="text-2xl font-bold">Skills to develop</h2>

          <p className="mt-1 text-[15px] text-neutral-500">
            These are the skills your AI analysis identified as the biggest
            opportunities for your target role.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {skillCards.map((skill) => (
              <div
                key={skill.id}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${skill.iconBg} ${skill.iconColor}`}
                  >
                    {skill.icon}
                  </span>

                  <ChevronRight size={18} className="text-neutral-300" />
                </div>

                <h3 className="mt-3 text-lg font-bold">{skill.name}</h3>

                <span
                  className={`mt-2 inline-block rounded px-2 py-0.5 text-xs font-semibold ${skill.priorityBg} ${skill.priorityColor}`}
                >
                  {skill.priority === "high"
                    ? "High priority"
                    : skill.priority === "medium"
                      ? "Medium priority"
                      : "Low priority"}
                </span>

                <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                  {skill.reason}
                </p>

                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">Gap</span>

                    <span className={`text-lg font-bold ${skill.percentColor}`}>
                      {skill.gapPercent}%
                    </span>
                  </div>

                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className={`h-full rounded-full ${skill.barColor}`}
                      style={{ width: `${skill.gapPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =================================================
            WHY + PATH
        ================================================= */}

        <section className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Sparkles size={18} className="text-blue-600" />
            Why MergeMate recommends these
          </h2>

          <ul className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {reasons.map((reason) => (
              <li key={reason.number} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600">
                  {reason.number}
                </span>

                <div className="min-w-0">
                  <p className="font-semibold">{reason.title}</p>

                  <p className="mt-1 text-[15px] leading-relaxed text-neutral-500">
                    {reason.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* =================================================
            PATH — full width so long skill lists have room
        ================================================= */}

        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <ArrowRight size={18} className="text-blue-600" />
            Your path to {role}
          </h3>

          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-stretch">
            {pathNodes}
          </div>
        </section>

        {/* =================================================
            CTA
        ================================================= */}

        <section className="mt-8 flex flex-col items-start justify-between gap-6 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Target size={20} />
            </span>

            <div>
              <h3 className="text-xl font-bold">Ready to close the gap?</h3>

              <p className="mt-1 max-w-xl text-[15px] text-neutral-500">
                MergeMate can now find open-source issues that match your
                current skills and help you build the missing ones.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 gap-3">
            <button
              onClick={() => navigate("/opportunities")}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Find Matching Issues
              <ChevronRight size={16} />
            </button>

            <button
              onClick={() => navigate("/questionnaire")}
              className="rounded-lg border border-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Review My Profile
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
