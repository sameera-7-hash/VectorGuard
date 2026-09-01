import { useEffect, useRef, useState } from "react"
import type { FormEvent } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, Bot, Fingerprint, Network, Send, ShieldQuestion, Sparkles, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Reveal } from "@/components/motion/Reveal"
import { RadarSweep } from "@/components/motion/RadarSweep"
import { sendThreatChatMessage } from "@/services/api"
import type { ThreatChatMatch } from "@/services/api"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  matchedThreats?: ThreatChatMatch[]
  confidenceScore?: number
}

const suggestedPrompts = [
  "What does a card testing ring look like?",
  "Explain account takeover attack patterns",
  "What graph anomalies indicate a fraud ring?",
  "How is RAG similarity scored here?",
]

const severityStyles: Record<string, string> = {
  HIGH: "border-red-500/40 bg-red-500/10 text-red-300",
  MEDIUM: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  LOW: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
}

const easeOut = [0.16, 1, 0.3, 1] as const

function ConfidenceGauge({ value }: { value: number }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100)
  const color = pct >= 70 ? "#34d399" : pct >= 40 ? "#fbbf24" : "#f87171"
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-800">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: easeOut }}
        />
      </div>
      <span className="font-mono text-[10px] text-slate-500">{pct}% conf.</span>
    </div>
  )
}

function ThreatMatchCard({ match, index }: { match: ThreatChatMatch; index: number }) {
  const severity = (match.severity ?? "UNKNOWN").toUpperCase()
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: easeOut }}
      className="border border-slate-800 bg-[#111826] p-3"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-200">{match.attack_type ?? "Unknown pattern"}</span>
        <Badge variant="outline" className={severityStyles[severity] ?? "border-slate-700 text-slate-400"}>
          {severity}
        </Badge>
      </div>
      {match.explanation && <p className="mt-2 text-xs leading-relaxed text-slate-500">{match.explanation}</p>}
      {match.recommended_action && (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-slate-600">Action: {match.recommended_action}</p>
      )}
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-blue-400"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  )
}

export function ThreatAnalyzerChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [txnId, setTxnId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, loading])

  const submitQuery = async (query: string) => {
    if (!query || loading) return

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: query }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)
    setError("")

    try {
      const response = await sendThreatChatMessage(query, txnId.trim() || undefined)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response.answer,
          matchedThreats: response.matched_threats,
          confidenceScore: response.confidence_score,
        },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reach the threat analyzer backend.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submitQuery(input.trim())
  }

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-yellow-300">Detection intelligence / 04</p>
            <h2 className="mt-2 text-4xl tracking-tight text-white">Threat Analyzer Chatbot</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-500">Ask about attack patterns and get answers grounded in the sentinelpay-threats vector index.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-200">
            <span className="relative flex size-1.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-indigo-400 opacity-75" /><span className="relative inline-flex size-1.5 rounded-full bg-indigo-300" /></span>
            RAG + LLM analyst
          </span>
        </div>
      </Reveal>

      {error && (
        <Reveal>
          <div className="flex items-start gap-2.5 border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs text-amber-200">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        </Reveal>
      )}

      <Reveal delay={0.1}>
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <Card className={`relative flex h-[560px] flex-col overflow-hidden border-slate-800 bg-[#0d1520] shadow-none ${loading ? "scan-grid" : ""}`}>
            {loading && <div className="scan-beam" />}
            <CardHeader className="relative z-10 border-b border-slate-800/80 px-5 py-4">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-100">
                <ShieldQuestion className="size-4 text-blue-400" />
                Ask the threat analyst
              </CardTitle>
            </CardHeader>

            <div ref={scrollRef} className="relative z-10 flex-1 space-y-4 overflow-y-auto p-5">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-300">
                    <ShieldQuestion className="size-5" />
                  </div>
                  <p className="max-w-xs text-sm text-slate-500">Ask about attack patterns, past incidents, or what a specific transaction's signals mean.</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestedPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => setInput(prompt)}
                        className="rounded-full border border-slate-800 bg-[#111826] px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-blue-500/40 hover:text-blue-200"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: easeOut }}
                    className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border ${message.role === "user" ? "border-slate-700 bg-[#1a1a24]" : "border-blue-500/30 bg-blue-500/10"}`}>
                      {message.role === "user" ? <User className="size-3.5 text-slate-400" /> : <Bot className="size-3.5 text-blue-300" />}
                    </div>
                    <div className={`max-w-[85%] space-y-3 ${message.role === "user" ? "items-end text-right" : ""}`}>
                      <div className={`inline-block rounded-2xl px-4 py-2.5 text-sm leading-6 ${message.role === "user" ? "bg-indigo-500/15 text-indigo-100" : "bg-white/[0.04] text-slate-300"}`}>
                        {message.content}
                      </div>
                      {message.confidenceScore !== undefined && (
                        <div className="flex items-center gap-3">
                          <ConfidenceGauge value={message.confidenceScore} />
                        </div>
                      )}
                      {message.matchedThreats && message.matchedThreats.length > 0 && (
                        <div className="grid gap-2 text-left sm:grid-cols-2">
                          {message.matchedThreats.map((match, index) => (
                            <ThreatMatchCard key={`${message.id}_${index}`} match={match} index={index} />
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300">
                    <RadarSweep size={16} />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl bg-white/[0.04] px-4 py-2.5">
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="relative z-10 space-y-2.5 border-t border-slate-800 p-4">
              <input
                value={txnId}
                onChange={(event) => setTxnId(event.target.value)}
                placeholder="Optional transaction ID for context (e.g. txn_0001)"
                className="w-full rounded-lg border border-slate-800 bg-[#111826] px-3 py-2 font-mono text-xs text-slate-300 placeholder:text-slate-600 focus:border-blue-500/50 focus:outline-none"
              />
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about a threat pattern..."
                  className="flex-1 rounded-full border border-slate-800 bg-[#111826] px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-blue-500/50 focus:outline-none"
                />
                <Button type="submit" disabled={loading || !input.trim()} className="shrink-0 rounded-full">
                  <Send className="size-3.5" />
                </Button>
              </div>
            </form>
          </Card>

          <div className="space-y-4">
            <Reveal delay={0.18}>
              <Card className="border-slate-800 bg-[#0d1520] shadow-none">
                <CardHeader className="border-b border-slate-800/80 px-4 py-3">
                  <CardTitle className="flex items-center gap-2 text-xs font-medium text-slate-200">
                    <Sparkles className="size-3.5 text-indigo-300" /> Analyst capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                  {[
                    { icon: Network, text: "Reasons over retrieved historical threat vectors" },
                    { icon: Fingerprint, text: "Explains why a transaction matched an attack signature" },
                    { icon: ShieldQuestion, text: "Answers open questions about detection logic" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-start gap-2.5 text-xs text-slate-400">
                      <Icon className="mt-0.5 size-3.5 shrink-0 text-slate-600" />
                      <span>{text}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </Reveal>

            <Reveal delay={0.24}>
              <Card className="border-slate-800 bg-[#0d1520] shadow-none">
                <CardHeader className="border-b border-slate-800/80 px-4 py-3">
                  <CardTitle className="text-xs font-medium text-slate-200">Try asking</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 p-4">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setInput(prompt)}
                      className="rounded-lg border border-slate-800 bg-[#111826] px-3 py-2 text-left text-xs text-slate-400 transition-colors hover:border-blue-500/40 hover:text-blue-200"
                    >
                      {prompt}
                    </button>
                  ))}
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </Reveal>
    </div>
  )
}
