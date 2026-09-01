import { useState, type FormEvent } from "react"
import { AlertTriangle, Check, CheckCircle2, ChevronRight, CircleDot, Loader2, RefreshCw, Search, Send, ShieldCheck, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Reveal, RevealItem, RevealStagger } from "@/components/motion/Reveal"
import { mockTransaction } from "@/mocks/dashboard"
import { CHAT_API_BASE_URL, submitFeedback, type FeedbackVerdict } from "@/services/api"
import { cn } from "@/lib/utils"

const steps = [
  { label: "Initial Detection", status: "MISSED", time: "14:31:42 UTC", icon: Search, tone: "border-red-500/60 bg-red-500/10 text-red-300", detail: "Behavioral mimicry scenario passed through the initial policy set." },
  { label: "Feedback Analysis", status: "UPDATING", time: "14:32:01 UTC", icon: Sparkles, tone: "border-yellow-500/60 bg-yellow-500/10 text-yellow-300", detail: "The defense loop is converting the miss into three new protections." },
  { label: "Retest", status: "QUEUED", time: "14:32:08 UTC", icon: RefreshCw, tone: "border-slate-600 bg-slate-800/50 text-slate-300", detail: "The same attack will be replayed against the updated ensemble." },
  { label: "Final Detection", status: "PENDING", time: "--:--:-- UTC", icon: ShieldCheck, tone: "border-slate-700 bg-slate-800/30 text-slate-500", detail: "Waiting for the retest result to close the feedback loop." },
]

function FeedbackForm() {
  const [verdict, setVerdict] = useState<FeedbackVerdict>("CONFIRMED_FRAUD")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setStatus("idle")
    setErrorMessage("")
    try {
      await submitFeedback({ txnId: mockTransaction.id, verdict, notes })
      setStatus("success")
      setNotes("")
    } catch (error) {
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Unable to reach the feedback backend.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="border-slate-800 bg-[#0d1520] shadow-none">
      <CardHeader className="border-b border-slate-800/80 px-5 py-4">
        <CardTitle className="text-sm font-medium text-slate-100">Analyst Feedback</CardTitle>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate-600">{mockTransaction.id}</p>
      </CardHeader>
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: "CONFIRMED_FRAUD", label: "Confirm Fraud" },
              { value: "FALSE_POSITIVE", label: "False Positive" },
            ] as const).map(({ value, label }) => (
              <label
                key={value}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 border px-3.5 py-3 text-sm transition-colors",
                  verdict === value ? "border-blue-500/60 bg-blue-500/10 text-white" : "border-slate-800 bg-[#0a1019] text-slate-400 hover:border-slate-600"
                )}
              >
                <input
                  type="radio"
                  name="verdict"
                  value={value}
                  checked={verdict === value}
                  onChange={() => setVerdict(value)}
                  className="size-3.5 accent-blue-500"
                />
                {label}
              </label>
            ))}
          </div>

          <div>
            <label htmlFor="analyst-notes" className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-600">Analyst notes</label>
            <textarea
              id="analyst-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              placeholder="Describe what confirmed or ruled out this verdict..."
              className="w-full resize-none border border-slate-800 bg-[#0a1019] px-3.5 py-3 text-sm text-slate-200 placeholder:text-slate-600 transition-colors focus:border-blue-500/60 focus:outline-none"
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full bg-blue-500 text-white hover:bg-blue-400">
            {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Send className="mr-2 size-4" />}
            {submitting ? "Submitting..." : "Submit Feedback"}
          </Button>

          {status === "success" && (
            <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="size-3.5 shrink-0" /> Feedback recorded. The ensemble will retrain on this case.
            </div>
          )}
          {status === "error" && (
            <div className="flex items-start gap-2 border border-amber-500/30 bg-amber-500/5 px-3.5 py-2.5 text-xs text-amber-200">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" /> Feedback backend unreachable at <span className="font-mono">{CHAT_API_BASE_URL}</span> ({errorMessage}).
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

export function AdaptiveDefense() {
  return <div className="space-y-8">
    <Reveal><div><p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-400">Continuous learning / 02</p><h2 className="mt-2 text-4xl tracking-tight text-white">Adaptive Defense</h2><p className="mt-2 max-w-2xl text-sm text-slate-500">Confirm or dismiss a verdict and watch the autonomous feedback loop turn it into stronger detection coverage.</p></div></Reveal>
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
      <Reveal delay={0.1}><Card className="border-slate-800 bg-[#0d1520] shadow-none"><CardContent className="p-5 sm:p-8"><div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6"><div><p className="font-mono text-[10px] uppercase tracking-wider text-slate-600">Active learning case</p><p className="mt-2 font-mono text-lg text-slate-200">CASE-2026-0825-0190</p></div><Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 font-mono text-[10px] text-blue-300">LOOP IN PROGRESS</Badge></div><RevealStagger className="relative space-y-8" step={0.12}>{steps.map(({ label, status, time, icon: Icon, tone, detail }, index) => <RevealItem key={label} className="relative flex gap-5 sm:gap-7">{index < steps.length - 1 && <div className="absolute left-5 top-12 h-[calc(100%+2rem)] w-px bg-slate-800" />}{index > 0 && <ChevronRight className="absolute -left-1 top-0 hidden size-4 -rotate-90 text-slate-700 sm:block" />}<div className={`relative z-1 flex size-10 shrink-0 items-center justify-center rounded-full border ${tone}`}><Icon className="size-4" /></div><div className="min-w-0 flex-1 pb-1"><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><h3 className="text-base font-medium text-slate-200">{label}</h3><span className="font-mono text-[10px] text-slate-600">{time}</span><Badge variant="outline" className={`font-mono text-[9px] ${status === "MISSED" ? "border-red-500/30 text-red-300" : status === "UPDATING" ? "border-blue-500/30 text-blue-300" : "border-slate-700 text-slate-500"}`}>{status}</Badge></div><p className="mt-2 text-sm leading-relaxed text-slate-500">{detail}</p>{index === 1 && <div className="mt-4 grid gap-2 sm:grid-cols-3"><span className="flex items-center gap-2 border border-blue-500/20 bg-blue-500/5 px-3 py-2 font-mono text-[10px] text-blue-200"><Check className="size-3 text-blue-400" />Fraud Pattern Knowledge</span><span className="flex items-center gap-2 border border-blue-500/20 bg-blue-500/5 px-3 py-2 font-mono text-[10px] text-blue-200"><Check className="size-3 text-blue-400" />Detection Rule</span><span className="flex items-center gap-2 border border-blue-500/20 bg-blue-500/5 px-3 py-2 font-mono text-[10px] text-blue-200"><Check className="size-3 text-blue-400" />Attack Signature</span></div>}</div></RevealItem>)}</RevealStagger></CardContent></Card></Reveal>
      <Reveal delay={0.18}><FeedbackForm /></Reveal>
    </div>
    <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-slate-600"><CircleDot className="size-3 text-emerald-400" />Last model sync 14:28 UTC <Separator orientation="vertical" className="h-3 bg-slate-800" /> Next evaluation in 42 sec</div>
  </div>
}
