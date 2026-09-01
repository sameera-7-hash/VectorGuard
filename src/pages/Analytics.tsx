import { useEffect, useState } from "react"
import { ArrowUpRight, CheckCircle2, ChevronDown, Download, Radio, ShieldAlert, ShieldCheck, TrendingUp } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { getAnalyticsData } from "@/api/analytics"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AttackSimulationMap } from "@/components/motion/AttackSimulationMap"
import { Counter } from "@/components/motion/Counter"
import { Reveal, RevealItem, RevealStagger } from "@/components/motion/Reveal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { downloadCsv } from "@/lib/csv"
import { REGULATORY_POINTS } from "@/lib/regulatory"

// Chart colors read from Tailwind v4's auto-generated palette variables (--color-*)
// rather than hardcoded hex, so they stay in lockstep with the rest of the SOC theme.
const CHART = {
  before: "var(--color-red-400)",
  after: "var(--color-blue-400)",
  falsePositive: "var(--color-amber-400)",
  grid: "var(--color-slate-800)",
  axis: "var(--color-slate-600)",
}
const TYPE_COLORS = ["var(--color-red-400)", "var(--color-orange-400)", "var(--color-amber-400)", "var(--color-fuchsia-400)", "var(--color-violet-400)"]

const tooltipStyle = {
  background: "#0d1520",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  fontSize: 12,
  fontFamily: "ui-monospace, monospace",
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-800/40 ${className}`} />
}

export function Analytics() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getAnalyticsData>> | null>(null)
  const [showRegulatory, setShowRegulatory] = useState(false)
  useEffect(() => { void getAnalyticsData().then(setData) }, [])

  const exportImpactLog = () => {
    if (!data) return
    downloadCsv(
      "adaptive-defense-impact-log.csv",
      ["Attack Type", "Initial Detection", "Post-Feedback Detection", "Improvement"],
      data.impactLog.map((row) => [row.attackType, row.initialDetection, row.postFeedbackDetection, `+${row.improvement}%`]),
    )
  }

  const stats = data ? [
    { label: "Total Attacks Simulated", value: data.totalAttacksSimulated, format: (n: number) => Math.round(n).toLocaleString(), icon: Radio, tone: "text-yellow-300" },
    { label: "Overall Detection Rate", value: data.overallDetectionRate, format: (n: number) => `${n.toFixed(1)}%`, icon: CheckCircle2, tone: "text-emerald-400" },
    { label: "False Positive Rate", value: data.falsePositiveRate, format: (n: number) => `${n.toFixed(1)}%`, icon: ShieldAlert, tone: "text-amber-400" },
    { label: "Adaptive Improvement", value: data.adaptiveImprovement, format: (n: number) => `+${n.toFixed(1)}%`, icon: TrendingUp, tone: "text-emerald-400" },
  ] : []

  return (
    <div className="space-y-8">
      <Reveal>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-indigo-300">Intelligence / 06</p>
          <h2 className="mt-2 text-4xl tracking-tight text-white">Analytics &amp; Trends</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Detection performance over time and the impact of adaptive defense.</p>
        </div>
      </Reveal>

      {!data ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-28" />)}</div>
          <SkeletonBlock className="h-96" />
          <div className="grid gap-4 md:grid-cols-2"><SkeletonBlock className="h-72" /><SkeletonBlock className="h-72" /></div>
          <SkeletonBlock className="h-64" />
        </div>
      ) : (
        <>
          <RevealStagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, format, icon: Icon, tone }, index) => (
              <RevealItem key={label}>
                <Card className="border-slate-800 bg-[#0d1520] shadow-none transition-colors hover:border-slate-700">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
                        <Counter value={value} format={format} delay={0.1 + index * 0.06} className="mt-3 block font-mono text-3xl font-semibold tracking-tight text-slate-100" />
                      </div>
                      <Icon className={`size-5 ${tone}`} />
                    </div>
                    {label === "Adaptive Improvement" && <p className="mt-3 flex items-center gap-1 font-mono text-[10px] text-emerald-400"><ArrowUpRight className="size-3" /> vs cycle 1</p>}
                  </CardContent>
                </Card>
              </RevealItem>
            ))}
          </RevealStagger>

          <Reveal delay={0.06}>
            <Card className="overflow-hidden border-cyan-500/20 bg-[#0d1520] shadow-none">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/80 px-5 py-4">
                <div>
                  <CardTitle className="text-sm font-medium text-slate-100">Simulated Attack Activity</CardTitle>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate-600">Visualizing our own Red Team synthetic attack campaigns in real time.</p>
                </div>
                <Badge variant="outline" className="border-cyan-500/30 font-mono text-[10px] text-cyan-300">LIVE</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <AttackSimulationMap className="h-[360px] w-full sm:h-[440px]" />
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={0.1}>
            <Card className="border-slate-800 bg-[#0d1520] shadow-none">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/80 px-5 py-4">
                <div>
                  <CardTitle className="text-sm font-medium text-slate-100">Detection Rate Over Time</CardTitle>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate-600">Before vs. after adaptive defense, per attack cycle</p>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="h-80 w-full sm:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.detectionTrend} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                      <CartesianGrid stroke={CHART.grid} vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: CHART.axis, fontSize: 11 }} axisLine={{ stroke: CHART.grid }} tickLine={false} />
                      <YAxis domain={[50, 100]} unit="%" tick={{ fill: CHART.axis, fontSize: 11 }} axisLine={{ stroke: CHART.grid }} tickLine={false} width={48} />
                      <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#e4e4e7" }} formatter={(value) => `${Number(value).toFixed(1)}%`} />
                      <Legend wrapperStyle={{ fontSize: 11, fontFamily: "ui-monospace, monospace", color: "#71717a" }} />
                      <Line type="monotone" dataKey="beforeAdaptive" name="Before Adaptive Defense" stroke={CHART.before} strokeWidth={2} strokeDasharray="6 4" dot={false} />
                      <Line type="monotone" dataKey="afterAdaptive" name="After Adaptive Defense" stroke={CHART.after} strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-2">
            <Reveal delay={0.16}>
              <Card className="h-full border-slate-800 bg-[#0d1520] shadow-none">
                <CardHeader className="border-b border-slate-800/80 px-5 py-4">
                  <CardTitle className="text-sm font-medium text-slate-100">False Positive Rate Trend</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.falsePositiveTrend} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                        <defs>
                          <linearGradient id="fpGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={CHART.falsePositive} stopOpacity={0.35} />
                            <stop offset="100%" stopColor={CHART.falsePositive} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke={CHART.grid} vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: CHART.axis, fontSize: 11 }} axisLine={{ stroke: CHART.grid }} tickLine={false} />
                        <YAxis unit="%" tick={{ fill: CHART.axis, fontSize: 11 }} axisLine={{ stroke: CHART.grid }} tickLine={false} width={42} />
                        <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#e4e4e7" }} formatter={(value) => `${Number(value).toFixed(1)}%`} />
                        <Area type="monotone" dataKey="falsePositiveRate" name="False Positive Rate" stroke={CHART.falsePositive} strokeWidth={2} fill="url(#fpGradient)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal delay={0.2}>
              <Card className="h-full border-slate-800 bg-[#0d1520] shadow-none">
                <CardHeader className="border-b border-slate-800/80 px-5 py-4">
                  <CardTitle className="text-sm font-medium text-slate-100">Attacks by Type</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_auto]">
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={data.attacksByType} dataKey="count" nameKey="type" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
                            {data.attacksByType.map((entry, index) => <Cell key={entry.type} fill={TYPE_COLORS[index % TYPE_COLORS.length]} stroke="none" />)}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#e4e4e7" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                      {data.attacksByType.map(({ type, count }, index) => (
                        <div key={type} className="flex items-center gap-2 text-xs">
                          <span className="size-2 shrink-0 rounded-full" style={{ background: TYPE_COLORS[index % TYPE_COLORS.length] }} />
                          <span className="text-slate-400">{type}</span>
                          <span className="ml-auto font-mono text-slate-200">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>

          <Reveal delay={0.26}>
            <Card className="border-slate-800 bg-[#0d1520] shadow-none">
              <CardHeader className="flex flex-row items-end justify-between border-b border-slate-800/80 px-5 py-4">
                <div>
                  <CardTitle className="text-sm font-medium text-slate-100">Adaptive Defense Impact Log</CardTitle>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate-600">Feedback cycles that turned a miss into a catch</p>
                </div>
                <Button variant="ghost" onClick={exportImpactLog} className="font-mono text-[10px] uppercase tracking-wider text-slate-500 hover:text-white">
                  <Download className="mr-1.5 size-3.5" /> Export CSV
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800 hover:bg-transparent">
                        <TableHead className="pl-5 font-mono text-[10px] uppercase tracking-wider text-slate-600">Attack Type</TableHead>
                        <TableHead className="font-mono text-[10px] uppercase tracking-wider text-slate-600">Initial Detection</TableHead>
                        <TableHead className="font-mono text-[10px] uppercase tracking-wider text-slate-600">Post-Feedback Detection</TableHead>
                        <TableHead className="pr-5 font-mono text-[10px] uppercase tracking-wider text-slate-600">Improvement</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.impactLog.map((row) => (
                        <TableRow key={row.id} className="border-slate-800/70">
                          <TableCell className="pl-5 text-sm text-slate-200">{row.attackType}</TableCell>
                          <TableCell><Badge variant="outline" className={row.initialDetection === "Missed" ? "border-red-500/40 bg-red-500/10 text-red-300" : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"}>{row.initialDetection}</Badge></TableCell>
                          <TableCell><Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300">{row.postFeedbackDetection}</Badge></TableCell>
                          <TableCell className="pr-5 font-mono text-sm font-semibold text-emerald-300">+{row.improvement}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={0.3}>
            <Card className="border-emerald-500/15 bg-[#0d1520] shadow-none">
              <button
                type="button"
                onClick={() => setShowRegulatory((v) => !v)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="size-4 text-emerald-400" />
                  <div>
                    <CardTitle className="text-sm font-medium text-slate-100">Regulatory &amp; Privacy Notice</CardTitle>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-600">Built for real-world deployment</p>
                  </div>
                </div>
                <ChevronDown className={`size-4 shrink-0 text-slate-500 transition-transform ${showRegulatory ? "rotate-180" : ""}`} />
              </button>
              {showRegulatory && (
                <CardContent className="grid gap-3 border-t border-slate-800/80 p-5 sm:grid-cols-2">
                  {REGULATORY_POINTS.map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-start gap-3">
                      <Icon className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                      <p className="text-sm text-slate-400">{text}</p>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          </Reveal>
        </>
      )}
    </div>
  )
}
