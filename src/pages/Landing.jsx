import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  ArrowRight,
  Shield,
  Zap,
  CheckCircle,
  Database,
  ScanLine,
  Layers,
  Copy,
  Radar,
  Gauge,
  Ticket,
  Sun,
  Moon,
  Bug,
} from "lucide-react";

function TypingCodeBlock({ code, delay = 0, speed = 25 }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    let index = 0;
    let timer;

    const startTyping = () => {
      timer = setInterval(() => {
        if (index < code.length) {
          setDisplayedText((prev) => prev + code.charAt(index));
          index++;
        } else {
          clearInterval(timer);
          setIsTypingComplete(true);
        }
      }, speed);
    };

    const delayTimeout = setTimeout(startTyping, delay);

    return () => {
      clearTimeout(delayTimeout);
      clearInterval(timer);
    };
  }, [code, delay, speed]);

  const renderHighlighted = (text) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      if (line.startsWith("#")) {
        return (
          <div key={idx} className="text-zinc-500 dark:text-zinc-400 italic">
            {line}
          </div>
        );
      }
      if (line.includes("vulnerax")) {
        const parts = line.split("vulnerax");
        return (
          <div key={idx} className="text-zinc-900 dark:text-zinc-100">
            {parts[0]}
            <span className="text-zinc-900 dark:text-zinc-100 font-bold">vulnerax</span>
            {parts[1]}
          </div>
        );
      }

      return <div key={idx} className="font-mono text-zinc-900 dark:text-zinc-100">{line}</div>;
    });
  };

  return (
    <pre className="mono overflow-x-auto p-4 text-[12.5px] leading-relaxed bg-[var(--background)]/50 min-h-[96px] relative flex flex-col justify-center">
      <div>
        {renderHighlighted(displayedText)}
        <span className={`inline-block w-1.5 h-4 ml-0.5 bg-[var(--foreground)] align-middle ${isTypingComplete ? "animate-pulse" : "animate-ping"}`} />
      </div>
    </pre>
  );
}

export default function Landing() {
  const { mode, toggleTheme } = useTheme();
  const isDark = mode === "dark";

  const gridStyle = {
    backgroundImage: isDark
      ? `
        linear-gradient(rgba(250, 250, 250, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(250, 250, 250, 0.02) 1px, transparent 1px)
      `
      : `
        linear-gradient(rgba(9, 9, 11, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(9, 9, 11, 0.02) 1px, transparent 1px)
      `,
    backgroundSize: "40px 40px",
    backgroundPosition: "center top",
  };

  const radialStyle = {
    background: isDark
      ? "radial-gradient(circle at 50% 30%, rgba(250, 250, 250, 0.015) 0%, transparent 60%)"
      : "radial-gradient(circle at 50% 30%, rgba(9, 9, 11, 0.01) 0%, transparent 60%)",
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans select-none smooth-transition">
      <style>{`
        @keyframes alternatingOpacity {
          0%, 100% {
            opacity: 0.08;
          }
          50% {
            opacity: 0.85;
          }
        }
        @keyframes alternatingSvgGlow {
          0%, 100% {
            filter: drop-shadow(0 0 1.5px var(--glow-color));
          }
          50% {
            filter: drop-shadow(0 0 8px var(--glow-color));
          }
        }
      `}</style>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)]/60 bg-[var(--background)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.6"
              stroke="var(--foreground)"
              style={{ filter: "drop-shadow(0 0 6px var(--glow-color))" }}
              className="w-6 h-6 shrink-0"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
            </svg>
            <span className="text-lg font-bold tracking-tight text-[var(--foreground)]">
              VulneraX
            </span>
          </Link>
          <nav className="flex items-center gap-5">
            <Link
              to="/findings"
              className="hidden text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] sm:block"
            >
              Findings
            </Link>
            <Link
              to="/priority"
              className="hidden text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] sm:block"
            >
              Threat Intel
            </Link>
            
            {/* Theme Toggler */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-all active:scale-95 cursor-pointer"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-[16px] h-[16px]" /> : <Moon className="w-[16px] h-[16px]" />}
            </button>

            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center whitespace-nowrap font-medium cursor-pointer transition-all bg-[var(--primary-600)] hover:bg-[var(--primary-600)]/90 text-[var(--primary-foreground)] rounded-md px-4 text-xs h-9"
            >
              Open Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden flex-1 flex flex-col items-center justify-center py-20 sm:py-32">
        <div className="pointer-events-none absolute inset-0 grid-fade" style={gridStyle} />
        <div className="pointer-events-none absolute inset-0" style={radialStyle} />
        
        <div className="relative mx-auto max-w-4xl px-5 text-center flex flex-col items-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--accent)] px-3.5 py-1 text-xs text-[var(--muted-foreground)] font-medium mb-6">
            <Zap className="w-3.5 h-3.5 text-[var(--foreground)]" />
            KEV · EPSS · CVSS Risk Fusion
          </span>
          
          <h1 className="text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl md:text-6xl text-[var(--foreground)]">
            Vulnerability Risk Prioritization
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
            Ingest every scanner, remove duplicate noise, enrich with live threat intelligence, and rank exactly what your team should fix first.
          </p>
          
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center whitespace-nowrap font-medium cursor-pointer transition-all bg-[var(--primary-600)] hover:bg-[var(--primary-600)]/90 text-[var(--primary-foreground)] rounded-md h-10 gap-2.5 px-6 text-sm"
            >
              Open Dashboard 
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/priority"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer transition-all border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--accent)] rounded-md h-10 px-6 text-sm"
            >
              View Risk Engine
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mx-auto max-w-6xl px-5 py-20 border-t border-[var(--border)]/40 w-full">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl text-[var(--foreground)]">
          How It Works
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-[var(--muted-foreground)]">
          A six-stage pipeline that turns raw scanner output into a defensible remediation order.
        </p>
        
        <div className="mt-12 flex flex-col lg:flex-row lg:items-stretch justify-between gap-4">
          {/* Card 1 */}
          <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 text-center hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200 group flex flex-col items-center justify-start">
            <div className="relative size-12 mb-4 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 rounded-md border border-[var(--border)] bg-[var(--accent)] transition-all duration-300" />
              <div 
                className="absolute inset-0 rounded-md border border-[var(--glow-color-solid)]/40 bg-[var(--glow-color-solid)]/5 shadow-[0_0_12px_var(--glow-color)]"
                style={{ animation: "alternatingOpacity 6s infinite ease-in-out", animationDelay: "0s" }}
              />
              <ScanLine 
                className="relative z-10 w-5 h-5 text-[var(--foreground)]" 
                style={{ animation: "alternatingSvgGlow 6s infinite ease-in-out", animationDelay: "0s" }}
              />
            </div>
            <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">Ingest</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)] leading-relaxed">
              ZAP · Nuclei · OpenVAS · Nmap
            </p>
          </div>

          {/* Arrow 1 */}
          <div className="flex items-center justify-center text-[var(--muted-foreground)]/50 shrink-0">
            <ArrowRight className="w-4 h-4 rotate-90 lg:rotate-0" />
          </div>

          {/* Card 2 */}
          <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 text-center hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200 group flex flex-col items-center justify-start">
            <div className="relative size-12 mb-4 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 rounded-md border border-[var(--border)] bg-[var(--accent)] transition-all duration-300" />
              <div 
                className="absolute inset-0 rounded-md border border-[var(--glow-color-solid)]/40 bg-[var(--glow-color-solid)]/5 shadow-[0_0_12px_var(--glow-color)]"
                style={{ animation: "alternatingOpacity 6s infinite ease-in-out", animationDelay: "1s" }}
              />
              <Layers 
                className="relative z-10 w-5 h-5 text-[var(--foreground)]" 
                style={{ animation: "alternatingSvgGlow 6s infinite ease-in-out", animationDelay: "1s" }}
              />
            </div>
            <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">Normalize</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)] leading-relaxed">
              Unified finding schema
            </p>
          </div>

          {/* Arrow 2 */}
          <div className="flex items-center justify-center text-[var(--muted-foreground)]/50 shrink-0">
            <ArrowRight className="w-4 h-4 rotate-90 lg:rotate-0" />
          </div>

          {/* Card 3 */}
          <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 text-center hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200 group flex flex-col items-center justify-start">
            <div className="relative size-12 mb-4 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 rounded-md border border-[var(--border)] bg-[var(--accent)] transition-all duration-300" />
              <div 
                className="absolute inset-0 rounded-md border border-[var(--glow-color-solid)]/40 bg-[var(--glow-color-solid)]/5 shadow-[0_0_12px_var(--glow-color)]"
                style={{ animation: "alternatingOpacity 6s infinite ease-in-out", animationDelay: "2s" }}
              />
              <Copy 
                className="relative z-10 w-5 h-5 text-[var(--foreground)]" 
                style={{ animation: "alternatingSvgGlow 6s infinite ease-in-out", animationDelay: "2s" }}
              />
            </div>
            <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">Deduplicate</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)] leading-relaxed">
              Fingerprint & cluster
            </p>
          </div>

          {/* Arrow 3 */}
          <div className="flex items-center justify-center text-[var(--muted-foreground)]/50 shrink-0">
            <ArrowRight className="w-4 h-4 rotate-90 lg:rotate-0" />
          </div>

          {/* Card 4 */}
          <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 text-center hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200 group flex flex-col items-center justify-start">
            <div className="relative size-12 mb-4 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 rounded-md border border-[var(--border)] bg-[var(--accent)] transition-all duration-300" />
              <div 
                className="absolute inset-0 rounded-md border border-[var(--glow-color-solid)]/40 bg-[var(--glow-color-solid)]/5 shadow-[0_0_12px_var(--glow-color)]"
                style={{ animation: "alternatingOpacity 6s infinite ease-in-out", animationDelay: "3s" }}
              />
              <Radar className="relative z-10 w-5 h-5 text-[var(--foreground)]" 
                style={{ animation: "alternatingSvgGlow 6s infinite ease-in-out", animationDelay: "3s" }}
              />
            </div>
            <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">Enrich</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)] leading-relaxed">
              KEV · EPSS · CVSS
            </p>
          </div>

          {/* Arrow 4 */}
          <div className="flex items-center justify-center text-[var(--muted-foreground)]/50 shrink-0">
            <ArrowRight className="w-4 h-4 rotate-90 lg:rotate-0" />
          </div>

          {/* Card 5 */}
          <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 text-center hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200 group flex flex-col items-center justify-start">
            <div className="relative size-12 mb-4 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 rounded-md border border-[var(--border)] bg-[var(--accent)] transition-all duration-300" />
              <div 
                className="absolute inset-0 rounded-md border border-[var(--glow-color-solid)]/40 bg-[var(--glow-color-solid)]/5 shadow-[0_0_12px_var(--glow-color)]"
                style={{ animation: "alternatingOpacity 6s infinite ease-in-out", animationDelay: "4s" }}
              />
              <Gauge className="relative z-10 w-5 h-5 text-[var(--foreground)]" 
                style={{ animation: "alternatingSvgGlow 6s infinite ease-in-out", animationDelay: "4s" }}
              />
            </div>
            <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">Score</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)] leading-relaxed">
              Composite risk rank
            </p>
          </div>

          {/* Arrow 5 */}
          <div className="flex items-center justify-center text-[var(--muted-foreground)]/50 shrink-0">
            <ArrowRight className="w-4 h-4 rotate-90 lg:rotate-0" />
          </div>

          {/* Card 6 */}
          <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 text-center hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200 group flex flex-col items-center justify-start">
            <div className="relative size-12 mb-4 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 rounded-md border border-[var(--border)] bg-[var(--accent)] transition-all duration-300" />
              <div 
                className="absolute inset-0 rounded-md border border-[var(--glow-color-solid)]/40 bg-[var(--glow-color-solid)]/5 shadow-[0_0_12px_var(--glow-color)]"
                style={{ animation: "alternatingOpacity 6s infinite ease-in-out", animationDelay: "5s" }}
              />
              <Ticket className="relative z-10 w-5 h-5 text-[var(--foreground)]" 
                style={{ animation: "alternatingSvgGlow 6s infinite ease-in-out", animationDelay: "5s" }}
              />
            </div>
            <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">Remediate</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)] leading-relaxed">
              Tickets & SLA tracking
            </p>
          </div>
        </div>
      </section>

      {/* Enterprise-Grade Security Section */}
      <section className="border-y border-[var(--border)]/60 bg-[var(--surface-2)]/20 w-full">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl text-[var(--foreground)]">
            Enterprise Security
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-[var(--muted-foreground)]">
            Built on the signals SOC and vulnerability-management teams actually act on.
          </p>
          
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1 */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
              <span className="grid size-9 place-items-center rounded-md bg-[var(--accent)] text-[var(--foreground)] border border-[var(--border)]">
                <Gauge className="w-4 h-4" />
              </span>
              <h3 className="mt-4 text-base font-bold text-[var(--foreground)]">Composite Risk Scoring</h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--muted-foreground)]">
                CVSS, EPSS, CISA KEV, exploit maturity, asset criticality and exposure fused into one ranked score.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
              <span className="grid size-9 place-items-center rounded-md bg-[var(--accent)] text-[var(--foreground)] border border-[var(--border)]">
                <Copy className="w-4 h-4" />
              </span>
              <h3 className="mt-4 text-base font-bold text-[var(--foreground)]">Cross-Scanner Dedup</h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--muted-foreground)]">
                Collapse overlapping ZAP, Nuclei, OpenVAS and Nmap output into a single authoritative finding.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
              <span className="grid size-9 place-items-center rounded-md bg-[var(--accent)] text-[var(--foreground)] border border-[var(--border)]">
                <Radar className="w-4 h-4" />
              </span>
              <h3 className="mt-4 text-base font-bold text-[var(--foreground)]">Live Threat Intel</h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--muted-foreground)]">
                KEV additions, EPSS refreshes and exploit-in-the-wild signals continuously re-rank your backlog.
              </p>
            </div>

            {/* Card 4 */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
              <span className="grid size-9 place-items-center rounded-md bg-[var(--accent)] text-[var(--foreground)] border border-[var(--border)]">
                <Bug className="w-4 h-4" />
              </span>
              <h3 className="mt-4 text-base font-bold text-[var(--foreground)]">Exploit Awareness</h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--muted-foreground)]">
                Know which CVEs have weaponized public exploits before an attacker proves it for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Powered by Open Scanners Section */}
      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-2 lg:items-center w-full">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-[var(--foreground)]">
            Powered by Open Scanners
          </h2>
          <p className="mt-4 text-sm text-[var(--muted-foreground)] leading-relaxed">
            VulneraX normalizes output from the tools you already run, so risk ranking works on day one — no rip-and-replace.
          </p>
          
          <ul className="mt-7 space-y-4">
            <li className="flex items-center gap-3 text-sm text-[var(--foreground)] font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              Four scanner feeds unified in one pipeline
            </li>
            <li className="flex items-center gap-3 text-sm text-[var(--foreground)] font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              Duplicate noise reduced by up to 62%
            </li>
            <li className="flex items-center gap-3 text-sm text-[var(--foreground)] font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              KEV and EPSS enrichment on every CVE
            </li>
            <li className="flex items-center gap-3 text-sm text-[var(--foreground)] font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              Asset criticality and business-unit context
            </li>
            <li className="flex items-center gap-3 text-sm text-[var(--foreground)] font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              SLA-aware remediation ticket tracking
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          {/* Code block 1 */}
          <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] transition-all duration-200">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2 bg-[var(--background)]/30">
              <span className="text-[12.5px] font-semibold text-[var(--foreground)]">Scanner Ingestion</span>
              <span className="mono text-[10.5px] text-[var(--muted-foreground)]">bash</span>
            </div>
            <TypingCodeBlock 
              code={`# Pull raw findings from every scanner
vulnerax ingest --source zap --file zap-report.json
vulnerax ingest --source nuclei --file nuclei.jsonl`} 
              delay={0}
              speed={20}
            />
          </div>

          {/* Code block 2 */}
          <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] transition-all duration-200">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2 bg-[var(--background)]/30">
              <span className="text-[12.5px] font-semibold text-[var(--foreground)]">Deduplication</span>
              <span className="mono text-[10.5px] text-[var(--muted-foreground)]">bash</span>
            </div>
            <TypingCodeBlock 
              code={`# Fingerprint on cve + asset + port + template
vulnerax dedup --strategy fingerprint \\
  --window 30d --merge-evidence`} 
              delay={3200}
              speed={20}
            />
          </div>

          {/* Code block 3 */}
          <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] transition-all duration-200">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2 bg-[var(--background)]/30">
              <span className="text-[12.5px] font-semibold text-[var(--foreground)]">Risk Scoring</span>
              <span className="mono text-[10.5px] text-[var(--muted-foreground)]">python</span>
            </div>
            <TypingCodeBlock 
              code={`score = (0.35 * cvss_norm + 0.30 * epss
         + 0.20 * kev_flag + 0.15 * asset_criticality)
rank = sorted(findings, key=score, reverse=True)`} 
              delay={6400}
              speed={20}
            />
          </div>
        </div>
      </section>

      {/* Ready to Rank Your Risk? Section */}
      <section className="border-t border-[var(--border)]/60 w-full bg-[var(--surface-2)]/20">
        <div className="mx-auto max-w-3xl px-5 py-24 text-center flex flex-col items-center">
          <Database className="w-8 h-8 text-[var(--foreground)] mb-6" />
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-[var(--foreground)]">
            Ready to Rank Your Risk?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-[var(--muted-foreground)]">
            Jump into the console to explore deduplicated findings, threat-intel enrichment and the prioritized remediation queue.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center whitespace-nowrap font-medium cursor-pointer transition-all bg-[var(--primary-600)] hover:bg-[var(--primary-600)]/90 text-[var(--primary-foreground)] rounded-md mt-8 h-10 gap-2 px-6 text-sm"
          >
            Open Dashboard 
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)]/60 py-8 text-center text-xs text-[var(--muted-foreground)] bg-[var(--background)] w-full">
        VulneraX — Risk Prioritization & Deduplication Console
      </footer>
    </div>
  );
}
