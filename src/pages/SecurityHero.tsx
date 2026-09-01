import { Fragment, useEffect, useRef, useState } from "react"
import type { CSSProperties } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import {
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  Gavel,
  GitBranch,
  MessageSquareText,
  RefreshCw,
  ScanSearch,
  ShieldAlert,
  ShieldCheck,
  ShieldHalf,
  Swords,
  TrendingUp,
  X,
} from "lucide-react"
import { Line, LineChart, ResponsiveContainer } from "recharts"
import { getAnalyticsData } from "@/api/analytics"
import { Badge } from "@/components/ui/badge"
import { CountUp } from "@/components/motion/CountUp"
import { Reveal, RevealItem, RevealStagger } from "@/components/motion/Reveal"
import { supabase } from "@/lib/supabase"
import { REGULATORY_POINTS } from "@/lib/regulatory"

const signals = [
  { label: "Threat detected", detail: "Credential stuffing pattern", tone: "danger" },
  { label: "IP verified", detail: "Reputation and geo match", tone: "safe" },
  { label: "Login anomaly", detail: "New device fingerprint", tone: "warning" },
]

const HERO_DRIFT_DOTS = [
  { top: "18%", left: "10%", dx: "10px", dy: "-8px", dur: "21s", delay: "0s" },
  { top: "72%", left: "22%", dx: "-8px", dy: "10px", dur: "26s", delay: "2s" },
  { top: "30%", left: "62%", dx: "9px", dy: "9px", dur: "19s", delay: "1s" },
  { top: "85%", left: "78%", dx: "-10px", dy: "-6px", dur: "24s", delay: "3.5s" },
  { top: "12%", left: "88%", dx: "-7px", dy: "9px", dur: "23s", delay: "1.5s" },
]

// Splits copy into per-letter spans so CSS can stagger them in on mount ("pixel
// grid assembling itself"), then appends a blinking block cursor timed to land
// right after the last letter. Screen readers get the plain string via aria-label;
// the letter spans themselves are aria-hidden to avoid reading it out twice.
function PixelBuildIn({ text }: { text: string }) {
  const words = text.split(" ")
  let letterIndex = 0
  return (
    <span aria-label={text}>
      {words.map((word, wordIndex) => (
        <Fragment key={wordIndex}>
          <span className="inline-block whitespace-nowrap">
            {word.split("").map((char, charIndex) => {
              const i = letterIndex++
              return (
                <span key={charIndex} className="pixel-letter" style={{ "--i": i } as CSSProperties} aria-hidden="true">
                  {char}
                </span>
              )
            })}
          </span>
          {wordIndex < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
      <span className="pixel-cursor" style={{ "--i": letterIndex } as CSSProperties} aria-hidden="true">
        ▌
      </span>
    </span>
  )
}

// The dashboard itself (Command Center, Red/Blue Team) is behind a Supabase login, so
// the marketing nav no longer links straight into it - that would just dead-end on a
// sign-in redirect. These point at the live read-only preview, in-page sections, and
// the public story page instead.
const navLinks: Array<{ label: string; href: string } | { label: string; to: string }> = [
  { label: "Product", to: "/preview" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Impact", href: "#impact" },
  { label: "About", to: "/about" },
]

const CONVENTIONAL = [
  "Single ML model",
  "Static thresholds",
  "Blind to zero-day patterns",
  "Black-box risk scores",
  "Manually curated test cases",
]

const VECTORGUARD = [
  "Rules + ML + Anomaly + Graph + RAG fused",
  "Purpose-built novelty testing",
  "Explainable AI reasoning per decision",
  "Autonomous 24/7 adversarial simulation",
  "Continuous self-improvement",
]

const HOW_IT_WORKS = [
  { title: "Red Team generates attack", detail: "A synthetic fraud scenario is created on demand - a real transaction shape, not a toy example.", icon: Swords },
  { title: "Blue Team analyzes", detail: "Five independent signals score it: rules, ML, anomaly detection, graph analysis, and RAG context.", icon: ScanSearch },
  { title: "Risk fusion scores it", detail: "The five layer scores are fused into one final risk score, not a single opaque number.", icon: GitBranch },
  { title: "Action taken", detail: "Allow, hold, or block - with the reasoning behind the decision, not just a verdict.", icon: Gavel },
  { title: "Analyst feedback", detail: "Confirmed fraud and false positives are logged back against the transaction.", icon: MessageSquareText },
  { title: "Adaptive defense retrains", detail: "Missed and borderline cases feed back into the ensemble automatically.", icon: RefreshCw },
]

export function SecurityHero() {
  const navigate = useNavigate()
  const [checkingSession, setCheckingSession] = useState(true)
  const [data, setData] = useState<Awaited<ReturnType<typeof getAnalyticsData>> | null>(null)
  const heroRef = useRef<HTMLElement>(null)
  const heroContentRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  // Ties the hero's background atmosphere and content to how far the hero has
  // scrolled past, instead of the pointer - a slow parallax drift on the grain/star
  // layer, and a gentle fade + scale-down on the content as the hero scrolls away.
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroBgY = useTransform(heroScroll, [0, 1], reduceMotion ? ["0%", "0%"] : ["0%", "18%"])
  const heroContentOpacity = useTransform(heroScroll, [0.55, 1], reduceMotion ? [1, 1] : [1, 0.15])
  const heroContentScale = useTransform(heroScroll, [0, 1], reduceMotion ? [1, 1] : [1, 0.97])
  // Writing these two through motion's `style` prop left opacity stuck (scale updated
  // fine through the same prop, oddly) - subscribing and mutating the ref directly
  // sidesteps whatever's going on there and is proven to work (same approach the old
  // cursor-tracking spotlight used).
  useEffect(() => {
    const unsubOpacity = heroContentOpacity.on("change", (v) => {
      if (heroContentRef.current) heroContentRef.current.style.opacity = String(v)
    })
    const unsubScale = heroContentScale.on("change", (v) => {
      if (heroContentRef.current) heroContentRef.current.style.transform = `scale(${v})`
    })
    return () => { unsubOpacity(); unsubScale() }
  }, [heroContentOpacity, heroContentScale])

  // A logged-in visitor lands on the dashboard, not the pitch page.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/command-center", { replace: true })
      else setCheckingSession(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/command-center", { replace: true })
    })
    return () => listener.subscription.unsubscribe()
  }, [navigate])

  useEffect(() => { void getAnalyticsData().then(setData) }, [])

  const scrollToHowItWorks = () => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })

  return (
    <main className="min-h-svh scroll-smooth overflow-hidden bg-[#05050a] text-white">
      {/* An overlay rather than an early return - the hero section below it (and the
          heroRef the scroll-parallax binds to) needs to mount on the very first render.
          framer-motion's useScroll only reads the target ref once, on mount; if the
          section were swapped in later post early-return, tracking would bind to a
          stale null ref and never animate. */}
      {checkingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05050a] font-mono text-xs text-slate-500">LOADING...</div>
      )}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <motion.nav
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between gap-4 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_20px_50px_-20px_rgba(79,70,229,0.35)] backdrop-blur-xl sm:px-6"
        >
          <Link to="/" className="group flex items-center gap-2.5 text-sm font-semibold tracking-tight text-white transition-opacity hover:opacity-80">
            <span className="flex size-8 items-center justify-center rounded-full bg-indigo-500 text-white transition-transform duration-300 group-hover:scale-110"><ShieldCheck className="size-4" /></span>
            VectorGuard
          </Link>
          <div className="hidden items-center gap-1 rounded-full border border-white/5 bg-white/[0.03] p-1 md:flex">
            {navLinks.map((link) => "href" in link ? (
              <a key={link.href} href={link.href} className="rounded-full px-4 py-1.5 text-[13px] font-medium text-white/60 transition-all duration-200 hover:-translate-y-px hover:bg-white/10 hover:text-white">
                {link.label}
              </a>
            ) : (
              <Link key={link.to} to={link.to} className="rounded-full px-4 py-1.5 text-[13px] font-medium text-white/60 transition-all duration-200 hover:-translate-y-px hover:bg-white/10 hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link to="/sign-in" className="rounded-full px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white">
              Log in
            </Link>
            <Link to="/sign-in?mode=signup" className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0a0a0f] shadow-[0_0_0_rgba(255,255,255,0)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-10px_rgba(255,255,255,0.35)]">
              Sign up
            </Link>
          </div>
        </motion.nav>

        {/* ==================================================
            HERO — terminal / pixel-grid aesthetic
        ================================================== */}
        <section
          ref={heroRef}
          id="product"
          className="hero-noir relative mt-6 scroll-mt-6 overflow-hidden rounded-[32px] border border-white/10"
        >
          <motion.div style={{ y: heroBgY }} className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
            <div className="hero-noir-grain absolute inset-0" />
            <div className="hero-noir-stars absolute inset-0" />
            {HERO_DRIFT_DOTS.map((dot, index) => (
              <span
                key={index}
                className="hero-noir-drift-dot absolute"
                style={{ top: dot.top, left: dot.left, "--dx": dot.dx, "--dy": dot.dy, "--dur": dot.dur, "--delay": dot.delay } as CSSProperties}
              />
            ))}
          </motion.div>
          <div className="hero-noir-scanlines pointer-events-none absolute inset-0 z-[1]" aria-hidden="true" />
          <div
            ref={heroContentRef}
            className="relative z-10 grid items-center gap-14 px-6 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:px-14 lg:py-24"
          >
            <div className="relative z-10 max-w-xl">
              <Reveal delay={0.05}>
                <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-200">
                  <span className="size-1.5 rounded-full bg-indigo-300" />
                  Red Team vs. Blue Team, running 24/7
                </span>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-5 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
                  // Autonomous Fraud Defense
                </p>
              </Reveal>
              <h1 className="hero-title pixel-headline mt-4 text-5xl leading-[1.15] text-white sm:text-6xl lg:text-[4rem]">
                <PixelBuildIn text="Stop fraud before it becomes a story." />
              </h1>
              <Reveal delay={0.22}>
                <p className="mt-7 max-w-lg text-base leading-7 text-indigo-100/70 sm:text-lg">
                  VectorGuard runs a continuous Red Team vs Blue Team adversarial loop — generating novel fraud patterns, detecting them across five independent signals, and closing detection gaps before real attackers find them.
                </p>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <Link to="/sign-in" className="hero-noir-btn-primary group inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white">
                    Login to Dashboard <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <button type="button" onClick={scrollToHowItWorks} className="hero-noir-btn-ghost group inline-flex items-center gap-1.5 rounded-full px-5 py-3 text-sm font-medium text-white/80">
                    See How It Works
                  </button>
                </div>
              </Reveal>
              <Reveal delay={0.36}>
                <p className="mt-6 text-sm text-indigo-100/45">Built for security teams</p>
              </Reveal>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 mx-auto w-full max-w-155"
            >
              <span className="absolute -top-4 left-6 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#0a0a12] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-200 shadow-lg">
                <ShieldHalf className="size-3" /> Live feed
              </span>
              <div className="dashboard-card rounded-2xl border border-white/15 bg-black/25 p-4 shadow-2xl shadow-indigo-950/30 backdrop-blur-[20px] sm:p-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/45">Live risk monitor</p>
                    <p className="mt-1 text-sm font-medium text-white">Transaction intelligence</p>
                  </div>
                  <div className="scan-status text-xs font-medium text-white/80">
                    <span className="status-scanning">Scanning...</span>
                    <span className="status-threat">Threat detected</span>
                    <span className="status-verified">Verified</span>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex items-end justify-between">
                    <span className="text-xs text-white/50">Network scan</span>
                    <span className="text-xs font-medium text-white/70">Live</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="scan-progress h-full rounded-full bg-white" /></div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 border-b border-white/10 pb-6">
                  <div><p className="text-xs text-white/45">Current risk</p><p className="risk-score mt-2 text-4xl font-semibold tracking-tight text-white" aria-label="Current risk score" /></div>
                  <div><p className="text-xs text-white/45">Signals resolved</p><p className="mt-2 text-4xl font-semibold tracking-tight text-white">24<span className="text-lg text-white/40">/28</span></p></div>
                </div>

                <div className="mt-5 space-y-2.5">
                  {signals.map(({ label, detail, tone }, index) => (
                      <div key={label} className="hero-reveal flex items-center justify-between gap-4 rounded-xl bg-white/6 px-4 py-3 [--delay:var(--signal-delay)]" style={{ "--signal-delay": `${580 + index * 100}ms` } as CSSProperties}>
                      <div className="flex min-w-0 items-center gap-3"><span className={`signal-dot signal-${tone} size-2 shrink-0 rounded-full`} /><div className="min-w-0"><p className="truncate text-sm font-medium text-white/90">{label}</p><p className="truncate text-xs text-white/40">{detail}</p></div></div>
                      <span className={`signal-badge signal-${tone} shrink-0 rounded-full border px-2 py-1 text-[10px] font-medium uppercase tracking-wider`}>{tone === "safe" ? <Check className="size-3" /> : tone}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ==================================================
            THE PROBLEM
        ================================================== */}
        <section className="py-16">
          <RevealStagger className="grid gap-4 sm:grid-cols-3">
            <RevealItem>
              <div className="h-full rounded-2xl border border-red-500/20 bg-white/[0.02] px-6 py-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-red-500/40">
                <p className="font-mono text-4xl font-semibold tracking-tight text-red-300 tabular-nums">
                  <CountUp target={79} suffix="%" />
                </p>
                <p className="mt-2 text-sm text-slate-400">of firms reported fraud attempts in 2024</p>
              </div>
            </RevealItem>
            <RevealItem>
              <div className="h-full rounded-2xl border border-red-500/20 bg-white/[0.02] px-6 py-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-red-500/40">
                <p className="font-mono text-4xl font-semibold tracking-tight text-red-300 tabular-nums">
                  <CountUp target={40} prefix="$" suffix="B+" />
                </p>
                <p className="mt-2 text-sm text-slate-400">in projected global fraud losses by 2027</p>
              </div>
            </RevealItem>
            <RevealItem>
              <div className="h-full rounded-2xl border border-red-500/20 bg-white/[0.02] px-6 py-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-red-500/40">
                <ShieldAlert className="mx-auto size-6 text-red-300" />
                <p className="mt-3 text-sm font-semibold text-white">Static systems can't adapt</p>
                <p className="mt-1 text-sm text-slate-400">Rule-based thresholds miss novel, evolving attack patterns.</p>
              </div>
            </RevealItem>
          </RevealStagger>
        </section>

        {/* ==================================================
            WHAT MAKES US DIFFERENT
        ================================================== */}
        <section className="py-16">
          <Reveal>
            <div className="mb-8 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-indigo-300">Detection vs. Defense</p>
              <h2 className="mt-2 text-3xl tracking-tight text-white sm:text-4xl">What Makes VectorGuard Different</h2>
            </div>
          </Reveal>
          <RevealStagger className="grid gap-4 md:grid-cols-2">
            <RevealItem>
              <div className="h-full overflow-hidden rounded-2xl border border-red-500/15 bg-white/[0.01]">
                <div className="border-b border-white/10 px-5 py-4"><p className="text-sm font-medium text-red-300/70">Conventional Systems</p></div>
                <div className="space-y-3 p-5">
                  {CONVENTIONAL.map((item) => (
                    <div key={item} className="flex items-start gap-2.5 text-sm text-slate-500">
                      <X className="mt-0.5 size-4 shrink-0 text-red-400/40" /> {item}
                    </div>
                  ))}
                </div>
              </div>
            </RevealItem>
            <RevealItem>
              <div className="h-full overflow-hidden rounded-2xl border border-blue-500/40 bg-[#0d1520] shadow-[0_0_50px_-24px_rgba(59,130,246,0.5)]">
                <div className="border-b border-white/10 px-5 py-4"><p className="text-sm font-medium text-blue-300">VectorGuard</p></div>
                <div className="space-y-3 p-5">
                  {VECTORGUARD.map((item) => (
                    <div key={item} className="flex items-start gap-2.5 text-sm text-white">
                      <Check className="mt-0.5 size-4 shrink-0 text-blue-400" /> {item}
                    </div>
                  ))}
                </div>
              </div>
            </RevealItem>
          </RevealStagger>
        </section>

        {/* ==================================================
            QUANTIFIED IMPACT
        ================================================== */}
        <div id="impact" className="scroll-mt-24 py-16">
          <Reveal>
            <div className="overflow-hidden rounded-[28px] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/8 via-[#0d1520] to-[#0d1520]">
              <div className="grid gap-8 p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-12">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300">Quantified Impact</p>
                  {data ? (
                    <div className="mt-4 flex items-end gap-3">
                      <span className="text-6xl font-semibold tracking-tight text-white sm:text-7xl">+{data.adaptiveImprovement}%</span>
                      <span className="mb-2 flex items-center gap-1 text-sm font-medium text-emerald-400"><TrendingUp className="size-4" /> detection lift</span>
                    </div>
                  ) : (
                    <div className="mt-4 h-16 w-48 animate-pulse rounded-xl bg-slate-800/50" />
                  )}
                  <p className="mt-3 max-w-sm text-sm text-slate-400">Detection rate improvement measured across a full adaptive defense cycle - missed attacks retrain the ensemble automatically.</p>
                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-red-500/40 bg-red-500/10 text-red-300">Missed</Badge>
                    <ArrowRight className="size-4 text-slate-600" />
                    <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300">Detected</Badge>
                    <span className="ml-2 text-xs text-slate-500">Before adaptive defense → after adaptive defense</span>
                  </div>
                </div>
                <div className="h-48 w-full sm:h-56">
                  {data && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.detectionTrend}>
                        <Line type="monotone" dataKey="beforeAdaptive" stroke="var(--color-red-400)" strokeWidth={2} strokeDasharray="6 4" dot={false} isAnimationActive={false} />
                        <Line type="monotone" dataKey="afterAdaptive" stroke="var(--color-emerald-400)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ==================================================
            HOW IT WORKS
        ================================================== */}
        <section id="how-it-works" className="scroll-mt-24 py-16">
          <Reveal>
            <div className="mb-10 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-indigo-300">How It Works</p>
              <h2 className="mt-2 text-3xl tracking-tight text-white sm:text-4xl">One closed loop, six steps</h2>
            </div>
          </Reveal>
          <RevealStagger className="flex flex-col gap-3 md:flex-row md:items-stretch md:gap-2">
            {HOW_IT_WORKS.map(({ title, detail, icon: Icon }, index) => (
              <Fragment key={title}>
                <RevealItem className="flex-1">
                  <div className="h-full rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/30">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-white/30">0{index + 1}</span>
                      <Icon className="size-4 text-indigo-300" />
                    </div>
                    <h4 className="mt-4 text-base text-white">{title}</h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/50">{detail}</p>
                  </div>
                </RevealItem>
                {index < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden shrink-0 items-center justify-center md:flex">
                    <ChevronRight className="size-4 text-white/20" />
                  </div>
                )}
              </Fragment>
            ))}
          </RevealStagger>
        </section>

        {/* ==================================================
            REGULATORY & PRIVACY READINESS
        ================================================== */}
        <section className="py-16">
          <Reveal>
            <div className="mb-8 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300">Built for Real-World Deployment</p>
              <h2 className="mt-2 text-3xl tracking-tight text-white sm:text-4xl">Regulatory &amp; Privacy Readiness</h2>
            </div>
          </Reveal>
          <RevealStagger className="grid gap-4 sm:grid-cols-2">
            {REGULATORY_POINTS.map(({ icon: Icon, text }) => (
              <RevealItem key={text}>
                <div className="flex h-full items-start gap-3 rounded-2xl border border-emerald-500/15 bg-white/[0.02] p-4">
                  <Icon className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                  <p className="text-sm text-slate-300">{text}</p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </section>

        {/* ==================================================
            BUSINESS CASE
        ================================================== */}
        <section className="py-16">
          <Reveal>
            <div className="flex flex-col items-start gap-6 rounded-[28px] border border-amber-500/15 bg-gradient-to-br from-amber-500/8 via-white/[0.02] to-transparent p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
              <div className="max-w-xl">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-300">Business Case</p>
                <p className="mt-3 text-lg leading-relaxed text-white">Blocking legitimate transactions costs banks customer trust and revenue just as much as missed fraud does. VectorGuard is tuned to catch fraud without creating friction that drives customers away.</p>
              </div>
              <div className="shrink-0 rounded-2xl border border-amber-500/20 bg-[#0d1520] px-6 py-5 text-center">
                <p className="text-3xl font-semibold text-amber-300">{data ? `${data.falsePositiveRate}%` : "—"}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate-500">False Positive Rate</p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ==================================================
            FOOTER CTA
        ================================================== */}
        <section className="border-t border-white/5 py-16 text-center">
          <Reveal>
            <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-indigo-400/30 bg-indigo-500/10 text-indigo-300"><Bot className="size-5" /></div>
            <h2 className="mx-auto mt-5 max-w-xl text-3xl tracking-tight text-white sm:text-4xl">It doesn't just detect. It attacks itself to get better.</h2>
            <div className="mt-8">
              <Link to="/sign-in" className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#0a0a0f] transition-transform hover:-translate-y-0.5">
                Login to Dashboard <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>
        </section>
      </div>
    </main>
  )
}
