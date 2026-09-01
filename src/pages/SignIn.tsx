import { useEffect, useState, type FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { AlertTriangle, ArrowLeft, Check, Eye, EyeOff, Fingerprint, Loader2, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

const highlights = [
  { label: "Real-time signal fusion", detail: "40+ risk signals scored in under 200ms" },
  { label: "Adaptive defense loop", detail: "Missed attacks retrain the ensemble automatically" },
  { label: "Zero standing trust", detail: "Every session is continuously re-verified" },
]

export function SignIn() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [mode, setMode] = useState<"signin" | "signup">(searchParams.get("mode") === "signup" ? "signup" : "signin")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [checkingSession, setCheckingSession] = useState(true)

  // Clicking the email confirmation link lands back here with a session already
  // established (Supabase parses it from the URL automatically) - so this picks that
  // up and moves on instead of showing a blank sign-in form to someone who just
  // confirmed their account. Also covers the ordinary case of an already-signed-in
  // visitor landing on this page directly.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/command-center")
      else setCheckingSession(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/command-center")
    })
    return () => listener.subscription.unsubscribe()
  }, [navigate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setNotice("")
    setSubmitting(true)

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          // The confirmation link gets opened from an email client, often on a
          // different device than the one sign-up happened on - so it must always
          // point at the real deployed domain, never window.location.origin (that
          // would bake in "localhost" whenever someone tests sign-up locally, which
          // is useless from any other device). VITE_SITE_URL must also be added to
          // Authentication -> URL Configuration -> Redirect URLs in the Supabase
          // dashboard, or Supabase rejects it and falls back to whatever "Site URL"
          // is configured there instead.
          emailRedirectTo: `${import.meta.env.VITE_SITE_URL || window.location.origin}/sign-in`,
        },
      })
      setSubmitting(false)
      if (signUpError) return setError(signUpError.message)
      // With email confirmation enabled (Supabase's default), sign-up succeeds but
      // returns no session until the user clicks the confirmation link - so there's
      // nothing to navigate into yet.
      if (!data.session) return setNotice("Account created. Check your email to confirm it before signing in.")
      navigate("/command-center")
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)
    if (signInError) return setError(signInError.message)
    navigate("/command-center")
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-[#05050a] font-mono text-xs text-slate-500">
        VERIFYING SESSION...
      </main>
    )
  }

  return (
    <main className="grid min-h-svh bg-[#05050a] text-white lg:grid-cols-[1.05fr_1fr]">
      <div className="security-hero scan-grid relative hidden flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14">
        <div className="scan-beam" />
        <Link to="/" className="relative z-10 flex items-center gap-2.5 text-sm font-semibold tracking-tight text-white">
          <span className="flex size-8 items-center justify-center rounded-full bg-white text-[#312e81]"><ShieldCheck className="size-4" /></span>
          VectorGuard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-md"
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-200">
            <Sparkles className="size-3.5" /> Built for security teams
          </span>
          <h1 className="hero-title text-5xl leading-[1.05] text-white xl:text-6xl">
            Access built for the team that <span className="text-amber-300">never sleeps.</span>
          </h1>
          <div className="mt-10 space-y-5">
            {highlights.map(({ label, detail }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.25 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-start gap-3"
              >
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300"><Check className="size-3.5" /></span>
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="mt-0.5 text-xs text-indigo-100/50">{detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <p className="relative z-10 text-xs text-indigo-100/40">Trusted signal, clear decisions, fewer false positives.</p>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-20">
        <Link to="/" className="mb-10 inline-flex w-fit items-center gap-2 text-xs font-medium text-white/40 transition-colors hover:text-white/70 lg:hidden">
          <ArrowLeft className="size-3.5" /> Back to VectorGuard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.02] p-7 shadow-[0_30px_80px_-30px_rgba(79,70,229,0.35)] backdrop-blur-xl sm:p-8"
        >
          <div className="mb-8 flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
            <button
              type="button"
              onClick={() => { setMode("signin"); setError(""); setNotice("") }}
              className={cn("flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors", mode === "signin" ? "bg-white text-[#0a0a0f]" : "text-white/50 hover:text-white")}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(""); setNotice("") }}
              className={cn("flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors", mode === "signup" ? "bg-white text-[#0a0a0f]" : "text-white/50 hover:text-white")}
            >
              Create account
            </button>
          </div>

          <h2 className="hero-title text-4xl text-white">{mode === "signin" ? "Welcome back." : "Get started."}</h2>
          <p className="mt-2 text-sm text-white/45">
            {mode === "signin" ? "Sign in to your security console." : "Set up access to the defense grid."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {mode === "signup" && (
              <div>
                <label htmlFor="name" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Full name</label>
                <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 transition-colors focus-within:border-indigo-400/60">
                  <Fingerprint className="size-4 text-white/30" />
                  <input id="name" type="text" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Jordan Ellis" className="w-full bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none" />
                </div>
              </div>
            )}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Work email</label>
              <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 transition-colors focus-within:border-indigo-400/60">
                <Mail className="size-4 text-white/30" />
                <input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" className="w-full bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none" />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider text-white/40">Password</label>
                {mode === "signin" && <button type="button" className="text-xs font-medium text-indigo-300 hover:text-indigo-200">Forgot?</button>}
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 transition-colors focus-within:border-indigo-400/60">
                <Lock className="size-4 text-white/30" />
                <input id="password" type={showPassword ? "text" : "password"} required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••••" className="w-full bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-white/30 transition-colors hover:text-white/60" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-300">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {notice && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-300">
                <Check className="mt-0.5 size-3.5 shrink-0" />
                <span>{notice}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0a0a0f] shadow-[0_10px_30px_-12px_rgba(255,255,255,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-12px_rgba(255,255,255,0.4)] disabled:pointer-events-none disabled:opacity-60"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {submitting ? "Verifying..." : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-white/35">
            {mode === "signin" ? "New to VectorGuard? " : "Already have an account? "}
            <button type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setNotice("") }} className="font-medium text-indigo-300 hover:text-indigo-200">
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </main>
  )
}
