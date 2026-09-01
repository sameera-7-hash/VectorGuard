import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Bell, Bot, CheckCircle2, Lock, Radio, ShieldAlert, ShieldCheck, Zap } from "lucide-react"
import { getDashboardData } from "@/api/dashboard"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Counter } from "@/components/motion/Counter"
import { Reveal, RevealItem, RevealStagger } from "@/components/motion/Reveal"
import { CyberGrid } from "@/components/motion/CyberGrid"

// A public, read-only slice of the real Command Center - same live snapshot data, no
// login required. It's intentionally not the full page: the goal is to let a visitor
// (or a hackathon judge) feel the product for a few seconds, then hand them the sign-up
// CTA before they reach the parts that need an account (running attacks, live sync).
export function CommandCenterPreview() {
  const [snapshot, setSnapshot] = useState<Awaited<ReturnType<typeof getDashboardData>> | null>(null)
  useEffect(() => { void getDashboardData().then(setSnapshot) }, [])

  const stats = snapshot ? [
    { label: "Total Analyzed", value: snapshot.totalAnalyzed, format: (n: number) => Math.round(n).toLocaleString(), icon: Radio, tone: "text-yellow-300" },
    { label: "Detection Rate", value: snapshot.detectionRate, format: (n: number) => `${n.toFixed(1)}%`, icon: CheckCircle2, tone: "text-emerald-400" },
    { label: "False Positive Rate", value: snapshot.falsePositiveRate, format: (n: number) => `${n.toFixed(1)}%`, icon: ShieldAlert, tone: "text-amber-400" },
    { label: "Active Alerts", value: snapshot.activeAlerts, format: (n: number) => Math.round(n).toString(), icon: Bell, tone: "text-red-400" },
  ] : []

  return (
    <main className="relative min-h-svh bg-[#0a0a0f] text-[#e4e4e7]">
      <CyberGrid className="cyber-grid-bg" />

      <div className="relative mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        <Reveal>
          <nav className="flex items-center justify-between gap-4 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 backdrop-blur-xl sm:px-6">
            <Link to="/" className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-white">
              <span className="flex size-8 items-center justify-center rounded-full bg-indigo-500 text-white"><ShieldCheck className="size-4" /></span>
              VectorGuard
            </Link>
            <div className="flex items-center gap-2">
              <Link to="/sign-in" className="rounded-full px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white">Log in</Link>
              <Link to="/sign-in?mode=signup" className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0a0a0f] transition-transform hover:-translate-y-0.5">Sign up free</Link>
            </div>
          </nav>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-indigo-300">
            <Lock className="size-3" /> Live preview / read-only
          </div>
          <h1 className="mt-2 text-3xl tracking-tight text-white sm:text-4xl">Command Center</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">This is the same live data feed the real dashboard runs on. Sign up to run attacks, watch the Blue Team respond, and see the full transaction feed.</p>
        </Reveal>

        <div className="relative mt-8">
          {!snapshot ? (
            <div className="flex h-64 items-center justify-center font-mono text-xs text-slate-500">LOADING DEFENSE GRID...</div>
          ) : (
            <div className="space-y-6 pb-24">
              <RevealStagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map(({ label, value, format, icon: Icon, tone }, index) => (
                  <RevealItem key={label}>
                    <Card className="border-slate-800 bg-[#0d1520] shadow-none">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
                            <Counter value={value} format={format} delay={0.1 + index * 0.06} className="mt-3 block font-mono text-3xl font-semibold tracking-tight text-slate-100" />
                          </div>
                          <Icon className={`size-5 ${tone}`} />
                        </div>
                      </CardContent>
                    </Card>
                  </RevealItem>
                ))}
              </RevealStagger>

              <Reveal delay={0.12}>
                <div className="grid gap-4 xl:grid-cols-2">
                  <Card className="border-red-500/20 bg-[#0d1520] shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/80 px-5 py-4">
                      <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-200"><span className="size-2 rounded-full bg-red-400 shadow-[0_0_10px_#f87171]" /> Red Team Status</CardTitle>
                      <Badge variant="outline" className="border-red-500/30 font-mono text-[10px] text-red-300">ACTIVE</Badge>
                    </CardHeader>
                    <CardContent className="p-5">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Current agent</p>
                      <p className="mt-2 flex items-center gap-2 font-mono text-lg text-white"><Bot className="size-4 text-red-400" />{snapshot.currentAgent}</p>
                      <p className="mt-2 text-xs text-slate-500">Generating adversarial scenarios</p>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-500/20 bg-[#0d1520] shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/80 px-5 py-4">
                      <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-200"><span className="size-2 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]" /> Blue Team Status</CardTitle>
                      <Badge variant="outline" className="border-emerald-500/30 font-mono text-[10px] text-emerald-300">DEFENDING</Badge>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-6 p-5">
                      <div><p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Detection rate</p><p className="mt-2 font-mono text-2xl text-blue-300">{snapshot.detectionRate}%</p></div>
                      <div><p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">False positive</p><p className="mt-2 font-mono text-2xl text-emerald-300">{snapshot.falsePositiveRate}%</p></div>
                    </CardContent>
                  </Card>
                </div>
              </Reveal>

              <Reveal delay={0.18}>
                <Card className="border-slate-800 bg-[#0d1520] opacity-50 shadow-none">
                  <CardHeader className="border-b border-slate-800/80 px-5 py-4">
                    <CardTitle className="text-sm font-medium text-slate-100">Alerts &amp; Recent Transactions</CardTitle>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate-600">Sign up to view the full feed</p>
                  </CardHeader>
                  <CardContent className="h-48" />
                </Card>
              </Reveal>
            </div>
          )}

          {/* Sticks to the bottom of the viewport once scrolled into view, fading the
              content above into the sign-up ask - the reader never has to hit a hard wall. */}
          <div className="sticky inset-x-0 bottom-0 z-10">
            <div className="pointer-events-none h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
            <div className="flex flex-col items-center gap-3 bg-[#0a0a0f] px-6 pb-10 pt-2 text-center">
              <p className="text-sm font-medium text-white">You're viewing a live, read-only preview.</p>
              <p className="max-w-sm text-xs text-white/50">Create a free account to run Red Team attacks and watch the Blue Team defend in real time.</p>
              <Link to="/sign-in?mode=signup" className="group mt-1 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#0a0a0f] transition-transform hover:-translate-y-0.5">
                <Zap className="size-4" /> Sign up to unlock <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
