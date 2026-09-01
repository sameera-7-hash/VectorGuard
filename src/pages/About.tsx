import { ArrowRight, Bot, GitBranch, LayoutDashboard, RefreshCw, ShieldAlert, ShieldCheck, Sparkles, Swords, Zap } from "lucide-react"
import { Link } from "react-router-dom"
import { Reveal, RevealItem, RevealStagger } from "@/components/motion/Reveal"

const pillars = [
  {
    label: "Red Team",
    title: "Six agents that never stop attacking",
    detail: "Synthetic account takeovers, velocity bursts, behavioral mimicry, transaction splitting, and zero-day patterns - generated on demand so the defense is always tested against something new.",
    icon: Swords,
    accent: "border-red-500/20 text-red-300",
    glow: "from-red-500/10",
  },
  {
    label: "Blue Team",
    title: "Five layers of independent judgment",
    detail: "A rule engine, an ML classifier, an LLM anomaly reasoner, graph analysis, and RAG-grounded context fuse into one risk score - so no single signal can be the whole decision.",
    icon: ShieldCheck,
    accent: "border-blue-500/20 text-blue-300",
    glow: "from-blue-500/10",
  },
  {
    label: "Dashboard",
    title: "One console, every signal in view",
    detail: "The Command Center, Red Team Lab, Blue Team Analysis, and Adaptive Defense screens sit on top of the same live backend - built so an analyst never has to piece the story together by hand.",
    icon: LayoutDashboard,
    accent: "border-violet-500/20 text-violet-300",
    glow: "from-violet-500/10",
  },
]

const loop = [
  { step: "01", title: "Attack", detail: "Red Team generates a synthetic fraud scenario - a real transaction shape, not a toy example.", icon: Zap },
  { step: "02", title: "Detect", detail: "Blue Team scores it across five independent layers and fuses them into one decision.", icon: ShieldAlert },
  { step: "03", title: "Decide", detail: "Allow, hold, or block - shown with the reasoning behind it, not just a number.", icon: Bot },
  { step: "04", title: "Adapt", detail: "Missed or borderline cases feed back into the ensemble, so the next attempt is harder to repeat.", icon: RefreshCw },
]

const metrics = [
  { label: "False positives cut", value: "-62%" },
  { label: "Signals fused per decision", value: "40+" },
  { label: "Median decision time", value: "180ms" },
]

export function About() {
  return (
    <main className="min-h-svh overflow-hidden bg-[#05050a] text-white">
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 lg:px-8">
        <Reveal>
          <nav className="flex items-center justify-between gap-4 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_20px_50px_-20px_rgba(79,70,229,0.35)] backdrop-blur-xl sm:px-6">
            <Link to="/" className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-white">
              <span className="flex size-8 items-center justify-center rounded-full bg-indigo-500 text-white"><ShieldCheck className="size-4" /></span>
              VectorGuard
            </Link>
            <div className="flex items-center gap-2">
              <Link to="/preview" className="hidden rounded-full px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white sm:inline-flex">
                Live preview
              </Link>
              <Link to="/sign-in?mode=signup" className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0a0a0f] transition-transform hover:-translate-y-0.5">
                Sign up
              </Link>
            </div>
          </nav>
        </Reveal>

        <section className="pt-16 pb-12 text-center sm:pt-20">
          <Reveal delay={0.05}>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-200">
              <Sparkles className="size-3.5" /> Adversarial Fraud Defense
            </span>
          </Reveal>
          <Reveal delay={0.12}>
            <h1 className="hero-title mx-auto max-w-3xl text-5xl leading-[1.08] text-white sm:text-6xl">
              We built the attacker and the defender in the same room.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-indigo-100/70 sm:text-lg">
              Most fraud demos show you a dashboard with numbers that came from nowhere. VectorGuard generates the attacks itself, defends against them in real time, and shows you exactly why every decision was made - so what you're watching is a real adversarial loop, not a slideshow.
            </p>
          </Reveal>
        </section>

        <RevealStagger className="grid gap-4 pb-16 md:grid-cols-3">
          {pillars.map(({ label, title, detail, icon: Icon, accent, glow }) => (
            <RevealItem key={label}>
              <div className={`relative h-full overflow-hidden rounded-2xl border bg-white/[0.02] p-6 ${accent}`}>
                <div className={`pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b ${glow} to-transparent`} />
                <Icon className="size-6" />
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">{label}</p>
                <h3 className="mt-2 text-xl text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{detail}</p>
              </div>
            </RevealItem>
          ))}
        </RevealStagger>

        <section className="border-t border-white/5 py-16">
          <Reveal>
            <div className="mb-10 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-indigo-300">How it works</p>
              <h2 className="mt-2 text-3xl tracking-tight text-white sm:text-4xl">A loop that closes itself</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-white/50">Every simulated attack runs through the same four-stage cycle the live dashboard visualizes end to end.</p>
            </div>
          </Reveal>
          <RevealStagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {loop.map(({ step, title, detail, icon: Icon }) => (
              <RevealItem key={step}>
                <div className="relative h-full rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-white/30">{step}</span>
                    <Icon className="size-4 text-indigo-300" />
                  </div>
                  <h4 className="mt-4 text-base text-white">{title}</h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/50">{detail}</p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </section>

        <section className="border-t border-white/5 py-16">
          <Reveal>
            <div className="grid gap-4 sm:grid-cols-3">
              {metrics.map(({ label, value }) => (
                <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.02] px-5 py-6 text-center">
                  <p className="text-3xl font-semibold tracking-tight text-white">{value}</p>
                  <p className="mt-1 text-xs text-white/40">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        <section className="border-t border-white/5 py-16">
          <Reveal>
            <div className="flex flex-col items-start gap-6 rounded-[28px] border border-white/10 bg-gradient-to-br from-indigo-500/10 via-white/[0.02] to-transparent p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
              <div>
                <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-300"><GitBranch className="size-3.5" /> One system, one loop</p>
                <h2 className="mt-3 max-w-md text-2xl text-white sm:text-3xl">Red Team and Blue Team running as one system, not two demos stitched together.</h2>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <Link to="/preview" className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white">
                  See the live preview
                </Link>
                <Link to="/sign-in?mode=signup" className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0a0a0f] transition-transform hover:-translate-y-0.5">
                  Sign up free <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </div>
    </main>
  )
}
