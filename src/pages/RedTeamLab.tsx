import { useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  Bot,
  Check,
  CreditCard,
  Crosshair,
  Fingerprint,
  Globe2,
  Loader2,
  MapPin,
  Play,
  Radar,
  ShieldCheck,
  Split,
  Timer,
  Zap,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

import {
  Reveal,
  RevealItem,
  RevealStagger,
} from "@/components/motion/Reveal"
import { RadarSweep } from "@/components/motion/RadarSweep"

import { useRedTeamSync, type SyncedAttackType } from "@/contexts/redTeamSync"
import { API_BASE } from "@/services/api"

import type { RiskBand } from "@/types/fraud"


// ============================================================
// ATTACK AGENTS
// ============================================================

const agents: Array<{
  index: number
  name: SyncedAttackType
  code: string
  detail: string
  icon: typeof Crosshair
}> = [
  { index: 1, name: "Account Takeover", code: "ATK-07", detail: "Credential & session abuse", icon: Fingerprint },
  { index: 2, name: "Velocity Fraud", code: "VEL-03", detail: "Burst transaction patterns", icon: Zap },
  { index: 3, name: "Behavioral Mimicry", code: "BHV-11", detail: "Customer rhythm simulation", icon: Radar },
  { index: 4, name: "Transaction Splitting", code: "SPL-02", detail: "Threshold evasion chains", icon: Split },
  { index: 5, name: "Novelty / Zero-Day", code: "NOV-01", detail: "Unknown attack surface", icon: Crosshair },
  { index: 6, name: "Card Testing", code: "CRD-05", detail: "Card enumeration / testing", icon: CreditCard },
  { index: 7, name: "Auto / Orchestrator", code: "AUTO-00", detail: "Multi-agent campaign", icon: Bot },
]


// ============================================================
// RISK BAND
// ============================================================

function bandFor(value: number): RiskBand {
  return value > 70 ? "high" : value > 40 ? "medium" : "low"
}

// The live Red Team API reports attack_type as e.g. "ACCOUNT_TAKEOVER" - this is only
// for the campaign summary grid's raw per-scenario labels, not the curated agent list above.
function prettifyAttackType(raw: string): string {
  return raw.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}


// ============================================================
// RED TEAM LAB
// ============================================================

export function RedTeamLab() {
  const [selected, setSelected] = useState<SyncedAttackType>("Account Takeover")
  const { state, runAttack } = useRedTeamSync()

  const generating = state.status === "generating"
  const analyzing = state.status === "analyzing"
  const busy = generating || analyzing

  const redTeamResult = state.attackType === selected ? state.redTeamResult : null
  const scenarioReady = redTeamResult != null

  const signals = redTeamResult?.signals
    ? [
        { label: "Amount deviation", value: redTeamResult.signals.amount_deviation, icon: Zap },
        { label: "Device anomaly", value: redTeamResult.signals.device_anomaly, icon: Fingerprint },
        { label: "Location anomaly", value: redTeamResult.signals.location_anomaly, icon: MapPin },
        { label: "Time anomaly", value: redTeamResult.signals.time_anomaly, icon: Timer },
        { label: "Velocity", value: redTeamResult.signals.velocity, icon: Globe2 },
      ]
    : [
        { label: "Amount deviation", value: 0, icon: Zap },
        { label: "Device anomaly", value: 0, icon: Fingerprint },
        { label: "Location anomaly", value: 0, icon: MapPin },
        { label: "Time anomaly", value: 0, icon: Timer },
        { label: "Velocity", value: 0, icon: Globe2 },
      ]

  const blueTeamLayers = state.attackType === selected ? state.analysis?.layers : undefined
  const blueTeamScore = state.attackType === selected ? state.analysis?.final_risk_score : undefined
  const blueTeamDecision = state.attackType === selected ? state.analysis?.decision : undefined
  const blueTeamExplanation = state.attackType === selected ? state.analysis?.explanation : undefined
  const syncError = state.attackType === selected ? state.error : ""
  const orchestratorScenarios = state.attackType === selected ? state.orchestratorScenarios : null

  return (
    <div className="space-y-8">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <Reveal>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-red-400">Adversarial simulation / 04</p>
            <h2 className="mt-2 text-4xl tracking-tight text-white">Red Team Lab</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Deploy autonomous attack agents against the current defense posture. Every generated payload syncs live into the Blue Team analysis engine.
            </p>
          </div>

          <Button
            onClick={() => void runAttack(selected)}
            disabled={busy}
            className="bg-red-500 text-white shadow-[0_0_24px_rgba(239,68,68,0.16)] hover:bg-red-400"
          >
            {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Play className="mr-2 size-4 fill-current" />}
            {generating ? "Generating attack..." : analyzing ? "Analyzing in Blue Team..." : "Run Attack"}
          </Button>
        </div>
      </Reveal>

      {/* ======================================================
          ERROR MESSAGE
      ====================================================== */}

      {syncError && (
        <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <strong>Red Team Error:</strong> {syncError}
        </div>
      )}

      {/* ======================================================
          MAIN GRID
      ====================================================== */}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">

        {/* ====================================================
            ATTACK AGENTS
        ==================================================== */}

        <Reveal delay={0.1}>
          <Card className="border-slate-800 bg-[#0d1520] shadow-none">
            <CardHeader className="border-b border-slate-800/80 px-5 py-4">
              <CardTitle className="text-sm font-medium text-slate-100">Select attack agent</CardTitle>
            </CardHeader>

            <CardContent className="p-5">
              <RevealStagger className="grid gap-3 sm:grid-cols-2" step={0.05}>
                {agents.map(({ index, name, code, detail, icon: Icon }) => (
                  <RevealItem key={name}>
                    <button
                      type="button"
                      onClick={() => setSelected(name)}
                      className={`group flex min-h-28 w-full flex-col justify-between border p-4 text-left transition ${
                        selected === name
                          ? "border-red-500/70 bg-red-500/10 shadow-[0_0_22px_rgba(239,68,68,0.08)]"
                          : "border-slate-800 bg-[#0a1019] hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <Icon className={`size-5 ${selected === name ? "text-red-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                        {selected === name && <Check className="size-4 text-red-300" />}
                      </div>
                      <div>
                        <p className="mt-4 text-sm font-medium text-slate-200">{index}. {name}</p>
                        <p className="mt-1 font-mono text-[10px] text-slate-600">{code} // {detail}</p>
                      </div>
                    </button>
                  </RevealItem>
                ))}
              </RevealStagger>
            </CardContent>
          </Card>
        </Reveal>

        {/* ====================================================
            GENERATED SCENARIO
        ==================================================== */}

        <Reveal delay={0.18}>
          <Card className="border-slate-800 bg-[#0d1520] shadow-none">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/80 px-5 py-4">
              <div>
                <CardTitle className="text-sm font-medium text-slate-100">Generated scenario</CardTitle>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate-600">{selected}</p>
              </div>
              {scenarioReady ? (
                <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">GENERATED</Badge>
              ) : generating && state.attackType === selected ? (
                <Badge variant="outline" className="border-red-500/30 text-red-300">GENERATING</Badge>
              ) : (
                <Badge variant="outline" className="border-slate-700 text-slate-500">STAGED</Badge>
              )}
            </CardHeader>

            <CardContent className="space-y-5 p-5">
              <div className="border-l-2 border-red-500/50 bg-red-500/5 px-4 py-3">
                <p className="text-sm leading-relaxed text-slate-300">
                  {redTeamResult?.transaction?.risk_reason ||
                    "Select an attack agent and click Run Attack to generate a real synthetic attack scenario."}
                </p>
              </div>

              {signals.map(({ label, value, icon: Icon }) => {
                const band = bandFor(value)
                return (
                  <div key={label}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs text-slate-400">
                        <Icon className="size-3.5 text-slate-600" />
                        {label}
                      </span>
                      <span className={`font-mono text-[10px] uppercase ${band === "high" ? "text-red-300" : band === "medium" ? "text-amber-300" : "text-emerald-300"}`}>
                        {band} / {value}
                      </span>
                    </div>
                    <Progress value={value} className="h-1.5 bg-slate-800 [&>div]:bg-red-400" />
                  </div>
                )
              })}

              {redTeamResult && (
                <div className="mt-6 border border-slate-800 bg-[#0a1019] p-4">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-slate-500">Attack generated successfully</p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div><span className="text-slate-600">Attack Type</span><p className="mt-1 text-slate-200">{redTeamResult.attack_type}</p></div>
                    <div><span className="text-slate-600">Fraud Label</span><p className="mt-1 text-red-300">{redTeamResult.fraud_label}</p></div>
                    <div><span className="text-slate-600">User ID</span><p className="mt-1 text-slate-200">{redTeamResult.transaction?.user_id || "N/A"}</p></div>
                    <div><span className="text-slate-600">Amount</span><p className="mt-1 text-slate-200">₹{Number(redTeamResult.transaction?.amount || 0).toLocaleString("en-IN")}</p></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Reveal>
      </div>

      {/* ======================================================
          MULTI-AGENT CAMPAIGN (Auto / Orchestrator)
      ====================================================== */}

      {orchestratorScenarios && (
        <Reveal delay={0.22}>
          <Card className="border-slate-800 bg-[#0d1520] shadow-none">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/80 px-5 py-4">
              <div>
                <CardTitle className="text-sm font-medium text-slate-100">Multi-agent campaign</CardTitle>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate-600">{orchestratorScenarios.length} agents deployed against one synthetic user · most severe scenario synced to Blue Team below</p>
              </div>
              <Badge variant="outline" className="border-red-500/30 font-mono text-[10px] text-red-300">AUTO-00</Badge>
            </CardHeader>
            <CardContent className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {orchestratorScenarios.map((scenario, index) => {
                const total = scenario.signals.amount_deviation + scenario.signals.device_anomaly + scenario.signals.location_anomaly + scenario.signals.time_anomaly + scenario.signals.velocity
                const isHeadline = redTeamResult?.transaction === scenario.transaction
                return (
                  <div key={index} className={`border p-3 transition-colors ${isHeadline ? "border-red-500/50 bg-red-500/5" : "border-slate-800 bg-[#0a1019]"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-slate-200">{prettifyAttackType(scenario.attack_type)}</p>
                      <Badge variant="outline" className={scenario.fraud_label ? "border-red-500/40 bg-red-500/10 text-red-300" : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"}>
                        {scenario.fraud_label ? "FRAUD" : "CLEAN"}
                      </Badge>
                    </div>
                    <p className="mt-2 font-mono text-[10px] text-slate-600">Avg signal {Math.round(total / 5)}/100</p>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </Reveal>
      )}

      {/* ======================================================
          BLUE TEAM LIVE SYNC
      ====================================================== */}

      <Reveal delay={0.26}>
        <Card className={`relative overflow-hidden border-blue-500/20 bg-[#0d1520] shadow-none ${analyzing ? "scan-grid" : ""}`}>
          {analyzing && <div className="scan-beam" />}
          <CardHeader className="relative z-10 flex flex-row items-center justify-between border-b border-slate-800/80 px-5 py-4">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-100">
              <ShieldCheck className="size-4 text-blue-400" /> Blue Team live sync
            </CardTitle>
            {analyzing ? (
              <Badge variant="outline" className="border-blue-500/30 font-mono text-[10px] text-blue-300">SCANNING</Badge>
            ) : blueTeamDecision ? (
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 font-mono text-[10px] text-emerald-300">SYNCED</Badge>
            ) : syncError ? (
              <Badge variant="outline" className="border-red-500/30 bg-red-500/10 font-mono text-[10px] text-red-300">SYNC FAILED</Badge>
            ) : (
              <Badge variant="outline" className="border-slate-700 font-mono text-[10px] text-slate-500">AWAITING ATTACK</Badge>
            )}
          </CardHeader>

          <CardContent className="relative z-10 p-5">
            {analyzing && (
              <div className="flex items-center gap-3 py-6 text-sm text-blue-300">
                <RadarSweep size={22} />
                Fusing signals across the detection ensemble...
              </div>
            )}

            {!analyzing && blueTeamLayers && (
              <div className="grid gap-6 lg:grid-cols-[1fr_1fr_auto]">
                <div className="space-y-4">
                  {blueTeamLayers.map(({ label, score }) => (
                    <div key={label}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-slate-400">{label}</span>
                        <span className="font-mono text-slate-300">{score}/100</span>
                      </div>
                      <Progress value={score} className="h-1.5 bg-slate-800 [&>div]:bg-blue-400" />
                    </div>
                  ))}
                </div>
                <div className="border-l border-slate-800 pl-6 text-sm leading-relaxed text-slate-400">
                  {blueTeamExplanation}
                </div>
                <div className="flex flex-col items-center justify-center gap-2 border-l border-slate-800 pl-6">
                  <span className="font-mono text-4xl font-semibold text-white">{blueTeamScore}</span>
                  <Badge
                    variant="outline"
                    className={
                      blueTeamDecision === "CRITICAL_BLOCK"
                        ? "border-red-500/40 bg-red-500/10 text-red-300"
                        : blueTeamDecision === "FLAG"
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                          : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    }
                  >
                    {blueTeamDecision}
                  </Badge>
                  <Link to="/blue-team" className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-blue-300 hover:text-blue-200">
                    Full analysis <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            )}

            {!analyzing && !blueTeamLayers && syncError && (
              <p className="py-6 text-center text-sm text-red-300/80">
                The synthetic transaction couldn't reach the Blue Team analysis backend at <span className="font-mono">{API_BASE}</span>. {syncError}
              </p>
            )}

            {!analyzing && !blueTeamLayers && !syncError && (
              <p className="py-6 text-center text-sm text-slate-600">
                Run an attack to see the Blue Team ensemble score it in real time.
              </p>
            )}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  )
}
