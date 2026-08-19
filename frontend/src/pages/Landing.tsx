import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  Code2,
  GitBranch,
  Search,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

import DotGrid from "../components/ui/DotGrid";

/* =========================================================
   SCROLL REVEAL
   ========================================================= */

function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add("landing-reveal-visible");
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -60px 0px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`landing-reveal ${className}`}>
      {children}
    </div>
  );
}

/* =========================================================
   MATCHES PREVIEW
   ========================================================= */

function MatchesPreview() {
  return (
    <div className="h-full w-full overflow-hidden rounded-xl border border-[#d0d7de] bg-white shadow-[0_16px_45px_rgba(31,35,40,0.10)]">
      {/* Browser bar */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[#d8dee4] bg-[#f6f8fa] px-4">
        <span className="h-2.5 w-2.5 rounded-full bg-[#d0d7de]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#d0d7de]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#d0d7de]" />

        <div className="ml-3 rounded-md bg-white px-4 py-1.5 text-[10px] text-[#57606a]">
          mergemate.app/matches
        </div>
      </div>

      <div className="grid h-[calc(100%-44px)] grid-cols-[180px_1fr]">
        {/* Sidebar */}
        <aside className="border-r border-[#d8dee4] bg-[#f6f8fa] p-4">
          <div className="mb-7 text-sm font-semibold text-[#24292f]">
            MergeMate
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="rounded-md bg-white px-3 py-2 font-medium text-[#2f6feb]">
              Matches
            </div>

            <div className="px-3 py-2 text-[#57606a]">
              Explore
            </div>

            <div className="px-3 py-2 text-[#57606a]">
              Saved issues
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="overflow-hidden p-6 sm:p-7">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-[#2f6feb]">
            Personalized search results
          </div>

          <h3 className="mt-1 text-xl font-bold tracking-tight text-[#24292f]">
            Matches for you
          </h3>

          <p className="mt-1 text-xs text-[#57606a]">
            Opportunities matched to your technical profile.
          </p>

          {/* Metrics */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-[#d0d7de] p-3">
              <p className="text-[9px] font-medium uppercase tracking-wide text-[#8c959f]">
                Focus skill
              </p>

              <p className="mt-1 text-sm font-semibold text-[#24292f]">
                TypeScript
              </p>
            </div>

            <div className="rounded-lg border border-[#d0d7de] p-3">
              <p className="text-[9px] font-medium uppercase tracking-wide text-[#8c959f]">
                GitHub candidates
              </p>

              <p className="mt-1 text-sm font-semibold text-[#24292f]">
                15
              </p>
            </div>

            <div className="rounded-lg border border-[#d0d7de] p-3">
              <p className="text-[9px] font-medium uppercase tracking-wide text-[#8c959f]">
                Recommended
              </p>

              <p className="mt-1 text-sm font-semibold text-[#24292f]">
                3
              </p>
            </div>
          </div>

          {/* Personalization */}
          <div className="mt-4 flex gap-3 rounded-lg border border-[#b6d7ff] bg-[#f0f6ff] p-4">
            <Target
              size={17}
              className="mt-0.5 shrink-0 text-[#2f6feb]"
            />

            <div>
              <p className="text-xs font-semibold text-[#24292f]">
                Personalized to your skill gap
              </p>

              <p className="mt-1 text-xs leading-5 text-[#57606a]">
                MergeMate evaluates each candidate against your background
                instead of relying on simple keyword matching.
              </p>
            </div>
          </div>

          {/* Issue */}
          <div className="mt-4 rounded-lg border border-[#d0d7de] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] text-[#8c959f]">
                  repository / project
                </p>

                <p className="mt-1 text-sm font-semibold text-[#24292f]">
                  Add CLI support for model discovery
                </p>

                <p className="mt-2 text-xs text-[#57606a]">
                  A beginner-friendly contribution opportunity matched to
                  your current skills.
                </p>
              </div>

              <span className="shrink-0 rounded-md bg-[#dafbe1] px-2.5 py-1 text-[10px] font-semibold text-[#1a7f37]">
                87% match
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   AI KICKSTART PREVIEW
   ========================================================= */

function AIKickstartPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#d0d7de] bg-white shadow-[0_16px_45px_rgba(31,35,40,0.10)]">
      <div className="flex h-11 items-center gap-2 border-b border-[#d8dee4] bg-[#f6f8fa] px-4">
        <span className="h-2.5 w-2.5 rounded-full bg-[#d0d7de]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#d0d7de]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#d0d7de]" />

        <div className="ml-3 rounded-md bg-white px-4 py-1.5 text-[10px] text-[#57606a]">
          mergemate.app/issue/1248
        </div>
      </div>

      <div className="p-6 sm:p-7">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#2f6feb]">
              AI Kickstart Guide
            </p>

            <h3 className="mt-1 text-lg font-bold tracking-tight text-[#24292f]">
              Add CLI support for model discovery
            </h3>
          </div>

          <span className="rounded-md bg-[#dafbe1] px-2.5 py-1 text-[10px] font-semibold text-[#1a7f37]">
            87% match
          </span>
        </div>

        <div className="mt-5 flex gap-3 rounded-lg border border-[#b6d7ff] bg-[#f0f6ff] p-4">
          <Sparkles
            size={17}
            className="mt-0.5 shrink-0 text-[#2f6feb]"
          />

          <div>
            <p className="text-xs font-semibold text-[#24292f]">
              Why this issue fits you
            </p>

            <p className="mt-1 text-xs leading-5 text-[#57606a]">
              This issue matches your TypeScript experience and gives you an
              opportunity to build practical CLI and backend skills.
            </p>
          </div>
        </div>

        <p className="mt-5 text-xs font-semibold text-[#24292f]">
          Your kickstart plan
        </p>

        <div className="mt-3 space-y-2">
          {[
            ["01", "Understand the repository"],
            ["02", "Find the right files"],
            ["03", "Plan your first change"],
          ].map(([number, title]) => (
            <div
              key={number}
              className="flex gap-4 rounded-lg border border-[#d0d7de] p-3.5"
            >
              <span className="text-[10px] font-semibold text-[#2f6feb]">
                {number}
              </span>

              <div>
                <p className="text-xs font-semibold text-[#24292f]">
                  {title}
                </p>

                <p className="mt-1 text-[10px] text-[#57606a]">
                  AI breaks the contribution into practical next steps.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DASHBOARD PREVIEW
   ========================================================= */

function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#d0d7de] bg-white shadow-[0_16px_45px_rgba(31,35,40,0.10)]">
      <div className="flex h-11 items-center gap-2 border-b border-[#d8dee4] bg-[#f6f8fa] px-4">
        <span className="h-2.5 w-2.5 rounded-full bg-[#d0d7de]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#d0d7de]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#d0d7de]" />

        <div className="ml-3 rounded-md bg-white px-4 py-1.5 text-[10px] text-[#57606a]">
          mergemate.app/dashboard
        </div>
      </div>

      <div className="grid grid-cols-[150px_1fr]">
        <aside className="border-r border-[#d8dee4] bg-[#f6f8fa] p-4">
          <p className="text-sm font-semibold text-[#24292f]">
            MergeMate
          </p>

          <div className="mt-6 space-y-1 text-[11px]">
            <div className="rounded-md bg-white px-3 py-2 font-medium text-[#2f6feb]">
              Dashboard
            </div>

            <div className="px-3 py-2 text-[#57606a]">
              Matches
            </div>

            <div className="px-3 py-2 text-[#57606a]">
              Explore
            </div>
          </div>
        </aside>

        <main className="p-6">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#2f6feb]">
            Your contribution profile
          </p>

          <h3 className="mt-1 text-xl font-bold tracking-tight text-[#24292f]">
            Ready to contribute.
          </h3>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              ["12", "Issues explored"],
              ["5", "Strong matches"],
              ["3", "Skills to improve"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-lg border border-[#d0d7de] p-3"
              >
                <p className="text-lg font-bold text-[#24292f]">
                  {value}
                </p>

                <p className="mt-1 text-[9px] text-[#8c959f]">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-[#d0d7de] p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#24292f]">
                Your current focus
              </p>

              <span className="text-[10px] font-medium text-[#2f6feb]">
                TypeScript
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#eaeef2]">
              <div className="h-full w-[72%] rounded-full bg-[#2f6feb]" />
            </div>

            <div className="mt-2 flex justify-between text-[9px] text-[#8c959f]">
              <span>Current skill</span>
              <span>72%</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-lg border border-[#d0d7de] p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#f0f6ff] text-[#2f6feb]">
              <GitBranch size={15} />
            </div>

            <div>
              <p className="text-xs font-semibold text-[#24292f]">
                3 opportunities waiting
              </p>

              <p className="mt-1 text-[10px] text-[#57606a]">
                Based on what you know and what you want to learn next.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   LANDING PAGE
   ========================================================= */

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#ffffff] text-[#24292f]">
      {/* Continuous background */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-80">
        <DotGrid
          dotSize={4}
          gap={18}
          baseColor="#d8dee4"
          activeColor="#2f6feb"
          proximity={120}
          shockRadius={220}
          shockStrength={4}
          resistance={800}
          returnDuration={1.5}
        />
      </div>

      {/* Soft readability layer */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-white/25" />

      {/* =====================================================
          FIXED NAVBAR
      ===================================================== */}

      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#d8dee4]/70 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2f6feb] text-white">
              <GitBranch size={17} />
            </div>

            <span className="text-sm font-bold tracking-tight">
              MergeMate
            </span>
          </button>

          {/* Only auth actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="hidden text-sm font-medium text-[#24292f] transition hover:text-[#2f6feb] sm:block"
            >
              Log in
            </button>

            <button
              onClick={() => navigate("/signup")}
              className="rounded-lg bg-[#2f6feb] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f6feb]"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="px-6 pb-12 pt-[120px] sm:pb-14">
          <div className="mx-auto max-w-[1100px] text-center">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#b6d7ff] bg-white/90 px-3 py-1.5 text-xs font-medium text-[#2f6feb] backdrop-blur-sm">
                <Sparkles size={14} />
                AI-powered open-source discovery
              </div>

              <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-bold leading-[1.05] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                Find open-source issues
                <span className="block text-[#2f6feb]">
                  you can actually solve.
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#57606a] sm:text-lg">
                MergeMate finds real GitHub issues based on your skills,
                experience, and goals — then gives you an{" "}
                <span className="font-semibold text-[#24292f]">
                  AI Kickstart Guide
                </span>{" "}
                so you know exactly how to start.
              </p>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => navigate("/signup")}
                  className="group flex items-center justify-center gap-2 rounded-lg bg-[#2f6feb] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1f6feb]"
                >
                  Find my first issue

                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              </div>
            </Reveal>
          </div>

          {/* =====================================================
              LAPTOP-SIZED MATCHES PREVIEW
          ===================================================== */}

          <Reveal className="mt-9 lg:mt-13">
            <div className="mx-auto w-full max-w-[1100px]">
              {/* 16:10 = normal laptop-style screen ratio */}
              <div className="aspect-[16/10] w-full">
                <MatchesPreview />
              </div>
            </div>
          </Reveal>
        </section>

        {/* =====================================================
            AI KICKSTART
        ===================================================== */}

        <section
          id="ai-kickstart"
          className="px-6 py-12 lg:py-16"
        >
          <div className="mx-auto max-w-[1240px]">
            <Reveal>
              <div className="grid items-center gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-14">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#b6d7ff] bg-white/90 px-3 py-1.5 text-xs font-medium text-[#2f6feb]">
                    <Sparkles size={13} />
                    AI Kickstart Guide
                  </div>

                  <h2 className="mt-5 text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-4xl">
                    Don't just find an issue.
                    <span className="block text-[#2f6feb]">
                      Know how to solve it.
                    </span>
                  </h2>

                  <p className="mt-4 max-w-md text-sm leading-6 text-[#57606a]">
                    Found an issue but don't know where to start? MergeMate's
                    AI Kickstart Guide turns an unfamiliar GitHub issue into
                    clear, practical steps.
                  </p>

                  <div className="mt-6 space-y-4">
                    {[
                      [
                        "01",
                        "Understand the issue",
                        "Know what the repository is actually asking contributors to change.",
                      ],
                      [
                        "02",
                        "Know what to learn",
                        "Identify the files, concepts, and technologies worth understanding.",
                      ],
                      [
                        "03",
                        "Make your first change",
                        "Get a practical starting point instead of staring at a huge codebase.",
                      ],
                    ].map(([number, title, description]) => (
                      <div
                        key={number}
                        className="flex gap-3"
                      >
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2f6feb] text-[9px] font-bold text-white">
                          {number}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-[#24292f]">
                            {title}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-[#57606a]">
                            {description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <AIKickstartPreview />
              </div>
            </Reveal>
          </div>
        </section>

        {/* =====================================================
            DASHBOARD
        ===================================================== */}

        <section
          id="dashboard"
          className="px-6 py-12 lg:py-16"
        >
          <div className="mx-auto max-w-[1240px]">
            <Reveal>
              <div className="grid items-center gap-10 lg:grid-cols-[1.22fr_0.78fr] lg:gap-14">
                <DashboardPreview />

                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#d0d7de] bg-white/90 px-3 py-1.5 text-xs font-medium text-[#57606a]">
                    <Target size={13} />
                    Built around your growth
                  </div>

                  <h2 className="mt-5 text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-4xl">
                    Your skills.
                    <span className="block text-[#2f6feb]">
                      Your contribution path.
                    </span>
                  </h2>

                  <p className="mt-4 max-w-md text-sm leading-6 text-[#57606a]">
                    MergeMate doesn't just show you random GitHub issues.
                    It learns what you know and helps you move toward the
                    skills you want next.
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-[#d0d7de] bg-white/90 p-4">
                      <Code2
                        size={17}
                        className="text-[#2f6feb]"
                      />

                      <p className="mt-3 text-xs font-semibold">
                        Skill-aware
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-[#57606a]">
                        Matches based on your actual background.
                      </p>
                    </div>

                    <div className="rounded-lg border border-[#d0d7de] bg-white/90 p-4">
                      <Bot
                        size={17}
                        className="text-[#2f6feb]"
                      />

                      <p className="mt-3 text-xs font-semibold">
                        AI-assisted
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-[#57606a]">
                        Understand what to do before you code.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}

        <section
          id="how-it-works"
          className="px-6 py-12 lg:py-16"
        >
          <div className="mx-auto max-w-[1100px]">
            <Reveal>
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#2f6feb]">
                  How it works
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
                  From "I want to contribute"
                  <br />
                  to your first pull request.
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#57606a]">
                  MergeMate removes the guesswork from your first open-source
                  contribution.
                </p>
              </div>

              <div className="mt-9 grid gap-4 md:grid-cols-3">
                {[
                  {
                    number: "01",
                    icon: Target,
                    title: "Tell us about yourself",
                    text: "Share your skills, experience, contributions, and the role you want to move toward.",
                  },
                  {
                    number: "02",
                    icon: Search,
                    title: "We search GitHub",
                    text: "MergeMate finds real open-source issues that fit your selected skills and technical background.",
                  },
                  {
                    number: "03",
                    icon: Sparkles,
                    title: "Get personalized matches",
                    text: "AI evaluates candidates and explains why each issue is a good fit for you.",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.number}
                      className="rounded-xl border border-[#d0d7de] bg-white/90 p-5 backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f6ff] text-[#2f6feb]">
                          <Icon size={17} />
                        </div>

                        <span className="text-[10px] font-semibold text-[#8c959f]">
                          {item.number}
                        </span>
                      </div>

                      <h3 className="mt-6 text-base font-semibold">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-xs leading-5 text-[#57606a]">
                        {item.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </section>

        {/* =====================================================
            CTA
        ===================================================== */}

        <section className="px-6 pb-16 pt-8 lg:pb-20 lg:pt-10">
          <div className="mx-auto max-w-[1100px]">
            <Reveal>
              <div className="relative overflow-hidden rounded-2xl border border-[#d0d7de] bg-white/95 px-7 py-11 text-center shadow-[0_12px_40px_rgba(31,35,40,0.08)] sm:px-12 sm:py-12">
                <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full bg-[#2f6feb]/8 blur-3xl" />

                <div className="relative">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[#2f6feb] text-white">
                    <Zap size={18} />
                  </div>

                  <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#2f6feb]">
                    Start contributing
                  </p>

                  <h2 className="mx-auto mt-2 max-w-xl text-3xl font-bold tracking-[-0.035em]">
                    Your next contribution is out there.
                  </h2>

                  <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#57606a]">
                    Let MergeMate find it based on what you know today and
                    what you want to learn next.
                  </p>

                  <button
                    onClick={() => navigate("/signup")}
                    className="group mx-auto mt-6 flex items-center gap-2 rounded-lg bg-[#2f6feb] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f6feb]"
                  >
                    Get started

                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="relative z-10 border-t border-[#d8dee4]/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#2f6feb] text-white">
              <GitBranch size={14} />
            </div>

            <span className="text-xs font-semibold">
              MergeMate
            </span>
          </div>

          <p className="text-[11px] text-[#8c959f]">
            Find where you can contribute.
          </p>
        </div>
      </footer>

      {/* =====================================================
          REVEAL ANIMATION
      ===================================================== */}

      <style>{`
        .landing-reveal {
          opacity: 0;
          transform: translateY(42px);
          transition:
            opacity 700ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .landing-reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .landing-reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}