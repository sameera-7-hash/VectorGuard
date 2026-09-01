import { BrowserRouter, Route, Routes } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import { RequireAuth } from "@/components/auth/RequireAuth"
import { About } from "@/pages/About"
import { AdaptiveDefense } from "@/pages/AdaptiveDefense"
import { Analytics } from "@/pages/Analytics"
import { BlueTeamAnalysis } from "@/pages/BlueTeamAnalysis"
import { CommandCenter } from "@/pages/CommandCenter"
import { CommandCenterPreview } from "@/pages/CommandCenterPreview"
import { RedTeamLab } from "@/pages/RedTeamLab"
import { SecurityHero } from "@/pages/SecurityHero"
import { SignIn } from "@/pages/SignIn"
import { ThreatAnalyzerChat } from "@/pages/ThreatAnalyzerChat"

export function App() {
  return <BrowserRouter><Routes><Route path="/" element={<SecurityHero />} /><Route path="/sign-in" element={<SignIn />} /><Route path="/about" element={<About />} /><Route path="/preview" element={<CommandCenterPreview />} /><Route element={<RequireAuth />}><Route element={<AppLayout />}><Route path="/command-center" element={<CommandCenter />} /><Route path="/red-team" element={<RedTeamLab />} /><Route path="/blue-team" element={<BlueTeamAnalysis />} /><Route path="/adaptive" element={<AdaptiveDefense />} /><Route path="/threat-analyzer" element={<ThreatAnalyzerChat />} /><Route path="/analytics" element={<Analytics />} /></Route></Route></Routes></BrowserRouter>
}

export default App
