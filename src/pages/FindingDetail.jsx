import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Ticket, ShieldAlert, ExternalLink } from "lucide-react";
import { LinearProgress, CircularProgress } from "@mui/material";
import { GitHub as GithubIcon } from "@mui/icons-material";
import { useScan } from "../context/ScanContext";
import { useAuth } from "../context/AuthContext";
import { SeverityBadge, ToolBadge, TierBadge } from "../components/ui/Badge";
import { getRemediationSuggestion, getAiOverview, createGithubIssue, getFindingById } from "../api/client";
import TicketComposerModal from "../components/TicketComposerModal";
import { MarkdownLite } from "../components/ui/MarkdownLite";

const getSeverityColor = (sev) => {
  const s = String(sev).toLowerCase();
  if (s === "critical") return "var(--sev-critical)";
  if (s === "high") return "var(--sev-high)";
  if (s === "medium") return "var(--sev-medium)";
  if (s === "low") return "var(--sev-low)";
  return "var(--muted-foreground)";
};

function Row({ label, value, tone }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3.5 last:border-0 border-b border-[var(--border)]/40">
      <span className="text-[12px] text-[var(--muted-foreground)]">{label}</span>
      <span className="mono text-[12px] font-bold text-right" style={tone ? { color: tone } : undefined}>
        {value}
      </span>
    </div>
  );
}

export default function FindingDetail() {
  const { findingId } = useParams();
  const navigate = useNavigate();
  const { session, githubToken, raisedTickets, markTicketRaised } = useScan();
  const { user } = useAuth();
  const [remediation, setRemediation] = useState(null); // { loading } | { text } | { error }
  const [aiOverview, setAiOverview] = useState(null); // { loading } | { text } | { error }
  const [remoteFinding, setRemoteFinding] = useState(null); // { loading } | { data } | { error }
  const [ticketDraft, setTicketDraft] = useState(false);
  const [creating, setCreating] = useState(false);

  const sessionFinding = session?.findings?.find((f) => f.finding_id === findingId);
  const finding = sessionFinding || remoteFinding?.data;

  // Fall back to a backend lookup when the finding isn't in the current
  // in-memory session — e.g. reached via Targets, which aggregates
  // persisted findings across all past sessions, not just the active one.
  // Only signed-in users can have persisted findings to look up at all.
  useEffect(() => {
    if (sessionFinding || !user) {
      setRemoteFinding(null);
      return;
    }
    setRemoteFinding({ loading: true });
    getFindingById(findingId)
      .then((data) => setRemoteFinding({ data }))
      .catch((e) => {
        const message = e.response?.status === 401
          ? "Sign in to view this finding."
          : e.response?.data?.detail || e.message;
        setRemoteFinding({ error: message });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [findingId, Boolean(sessionFinding), Boolean(user)]);

  const fetchOverview = async (target) => {
    setAiOverview({ loading: true });
    try {
      const r = await getAiOverview(target);
      setAiOverview({ text: r.overview });
    } catch (e) {
      const message = e.response?.status === 401
        ? "Sign in to generate an AI overview for this finding."
        : e.response?.data?.detail || e.message;
      setAiOverview({ error: message });
    }
  };

  // Always run the scanner/NVD description through AI analysis rather than
  // showing it verbatim — raw scanner text is thin ("SQL injection may be
  // possible.") or generic boilerplate, not specific to this finding.
  useEffect(() => {
    if (finding) fetchOverview(finding);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finding?.finding_id]);

  if (!finding) {
    if (remoteFinding?.loading) {
      return (
        <div className="flex items-center justify-center py-32">
          <CircularProgress size={28} />
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-[13px] text-[var(--muted-foreground)]">
          {remoteFinding?.error || "Finding not found."}
        </p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-[var(--primary-600)] hover:bg-[var(--primary-700)] text-[var(--primary-foreground)] rounded-md text-sm font-medium">
          Go Back
        </button>
      </div>
    );
  }

  const asset = finding.asset || {};
  const ti = finding.threat_intel || {};
  const risk = finding.risk_score || {};
  const host = asset.hostname || asset.ip || asset.domain || asset.url || "—";
  const path = asset.path || asset.url || "—";
  const color = getSeverityColor(finding.severity);
  // Which repo the ticket goes to is now chosen inside TicketComposerModal
  // itself, so only being connected (a token) is required to open it — a
  // repo doesn't need to already be pre-selected on the Tickets page.
  const isGithubConnected = Boolean(githubToken);

  // Fallback source material shown only if the AI call fails — raw NVD/
  // scanner text, never shown as the primary Overview.
  const fallbackText = ti.nvd_description || finding.description;
  const cleanFallback = fallbackText ? fallbackText.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim() : null;

  const hasExploitIntel = ti.has_public_exploit || ti.has_github_poc;

  const ticket = raisedTickets?.[finding.finding_id];
  const isRaised = ticket?.status === "raised";

  const fetchRemediation = async () => {
    setRemediation({ loading: true });
    try {
      const r = await getRemediationSuggestion(finding);
      setRemediation({ text: r.suggestion });
    } catch (e) {
      setRemediation({ error: e.response?.data?.detail || e.message });
    }
  };

  const openTicketComposer = () => {
    if (!isGithubConnected) {
      navigate("/tickets");
      return;
    }
    setTicketDraft(true);
  };

  const submitTicket = async (customDescription, customRemediation, repoFullName) => {
    setCreating(true);
    markTicketRaised(finding.finding_id, { status: "creating" });
    try {
      const r = await createGithubIssue(
        {
          finding_id: finding.finding_id,
          finding_data: finding,
          repo_full_name: repoFullName,
          custom_description: customDescription,
          custom_remediation: customRemediation,
          labels: ["security", "vulnerability", risk.priority_tier?.toLowerCase() || "vuln"],
        },
        githubToken
      );
      if (r.success) {
        markTicketRaised(finding.finding_id, { status: "raised", issue_number: r.issue_number, issue_url: r.issue_url });
        setTicketDraft(false);
      } else {
        markTicketRaised(finding.finding_id, null);
      }
    } catch (e) {
      markTicketRaised(finding.finding_id, null);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] smooth-transition cursor-pointer"
      >
        <ArrowLeft className="size-3.5" /> Back
      </button>

      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2.5">
          <SeverityBadge severity={finding.severity} />
          <TierBadge tier={risk.priority_tier || "UNSCORED"} />
          <ToolBadge tool={finding.source_tool} />
          {finding.finding_type && (
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--surface-2)] text-[var(--foreground)]">
              {finding.finding_type}
            </span>
          )}
          {ti.is_kev && (
            <span className="mono rounded-md border border-[var(--sev-critical)]/40 bg-[var(--sev-critical)]/10 px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--sev-critical)]">
              CISA KEV
            </span>
          )}
        </div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">{finding.vulnerability_name}</h1>
        <p className="mono text-[12px] text-[var(--muted-foreground)] mt-1.5">
          {finding.cve_id || finding.cwe_id || "No Identifier"} · {host} · {path}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-[220px_1fr]">
        {/* Risk Score Widget */}
        <div className="p-4 text-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] flex flex-col items-center justify-center">
          <p className="text-[10px] uppercase font-bold tracking-[0.14em] text-[var(--muted-foreground)]">Risk Score</p>
          <p className="mono mt-2 text-5xl font-extrabold" style={{ color, filter: `drop-shadow(0 0 8px color-mix(in oklab, ${color} 40%, transparent))` }}>
            {risk.final_score ?? "—"}
          </p>
          <p className="mono text-[11px] text-[var(--muted-foreground)] mt-1">/ 100</p>
          <div className="w-full mt-4">
            <LinearProgress
              variant="determinate"
              value={risk.final_score || 0}
              sx={{ height: 6, borderRadius: 3, backgroundColor: "var(--border)", "& .MuiLinearProgress-bar": { backgroundColor: color } }}
            />
          </div>
          <p className="mt-3.5 text-[10.5px] leading-relaxed text-[var(--muted-foreground)]">
            Weighted by exploitation signal: KEV, EPSS, ExploitDB, GitHub PoC, then CVSS.
          </p>
        </div>

        {/* Threat Intelligence Table */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)] mb-2">
            Threat Intelligence Details
          </p>
          <div className="divide-y divide-[var(--border)]/40 border border-[var(--border)]/60 rounded-lg overflow-hidden bg-[var(--surface-2)]/30">
            <Row label="Severity" value={(finding.severity || "unknown").toUpperCase()} />
            <Row label="CVSS Score" value={finding.cvss?.base_score != null ? finding.cvss.base_score.toFixed(1) : "—"} />
            <Row label="EPSS Score" value={ti.epss_score != null ? `${(ti.epss_score * 100).toFixed(2)}%` : "—"} />
            <Row label="CISA KEV List" value={ti.is_kev ? "YES" : "NO"} tone={ti.is_kev ? "var(--sev-critical)" : undefined} />
            <Row label="Public Exploit" value={ti.has_public_exploit ? "YES" : "NO"} tone={ti.has_public_exploit ? "var(--sev-high)" : undefined} />
            <Row label="GitHub PoC" value={ti.has_github_poc ? "YES" : "NO"} tone={ti.has_github_poc ? "var(--sev-high)" : undefined} />
            <Row label="Asset Criticality" value={asset.criticality?.toUpperCase() || "UNKNOWN"} />
            <Row label="Target Host" value={host} />
            <Row label="Path / Endpoint" value={path} />
            <Row label="Port / Protocol" value={asset.port ? `${asset.port}/${asset.protocol || "tcp"}` : "—"} />
            <Row label="Service Name" value={asset.service_name || "—"} />
          </div>
        </div>
      </div>

      <div className="h-px bg-[var(--border)]/60" />

      <div className="space-y-4">
        {/* Overview — always AI-analyzed from the scanner/NVD source text, never shown verbatim */}
        <div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">Overview</p>
              {aiOverview?.text && (
                <span className="text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded bg-[var(--accent)] text-[var(--muted-foreground)]">
                  AI Analysis
                </span>
              )}
            </div>
            <button
              onClick={() => fetchOverview(finding)}
              disabled={aiOverview?.loading}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-[var(--primary)]/40 text-[var(--primary)] hover:bg-[var(--primary)]/10 smooth-transition disabled:opacity-50 cursor-pointer"
            >
              {aiOverview?.loading ? <CircularProgress size={12} color="inherit" /> : <Sparkles className="size-3.5" />}
              {aiOverview?.loading ? "Analyzing…" : "Regenerate"}
            </button>
          </div>

          {aiOverview?.loading && !aiOverview?.text && (
            <p className="mt-1.5 text-[12.5px] text-[var(--muted-foreground)] p-3.5 rounded-lg border border-[var(--border)]/40 bg-[var(--surface-2)]/20">
              Analyzing this finding…
            </p>
          )}

          {aiOverview?.text && (
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--foreground)] bg-[var(--surface-2)]/20 p-3.5 rounded-lg border border-[var(--border)]/40 whitespace-pre-line">
              <MarkdownLite text={aiOverview.text} />
            </p>
          )}

          {aiOverview?.error && (
            <div className="mt-1.5 space-y-2">
              <p className="text-[11.5px] text-[var(--sev-critical)]">{aiOverview.error}</p>
              {cleanFallback && (
                <p className="text-[12.5px] leading-relaxed text-[var(--foreground)] bg-[var(--surface-2)]/20 p-3.5 rounded-lg border border-[var(--border)]/40 whitespace-pre-line">
                  {cleanFallback}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Exploit Intelligence */}
        {hasExploitIntel && (
          <div className="rounded-lg border border-[var(--sev-high)]/30 bg-[var(--sev-high)]/5 p-3.5">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sev-high)]">
              <ShieldAlert className="size-3.5" /> Exploit Intelligence
            </p>
            <div className="mt-2 space-y-2 text-[12px] text-[var(--foreground)]">
              {ti.has_public_exploit && (ti.exploit_descriptions || []).map((d, i) => (
                <p key={`edb-${i}`} className="flex items-start gap-1.5">
                  <ExternalLink className="size-3.5 mt-0.5 shrink-0 text-[var(--muted-foreground)]" />
                  <span>{d}</span>
                </p>
              ))}
              {ti.has_github_poc && (ti.github_poc_urls || []).map((url, i) => (
                <p key={`poc-${i}`} className="flex items-start gap-1.5">
                  <GithubIcon sx={{ fontSize: 14, mt: "1px" }} className="shrink-0 text-[var(--muted-foreground)]" />
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline break-all">{url}</a>
                </p>
              ))}
            </div>
          </div>
        )}

        {/* AI Remediation */}
        <div className="rounded-lg border border-[var(--border)]/60 bg-[var(--surface-2)]/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              <Sparkles className="size-3.5" /> AI Remediation
            </p>
            <button
              onClick={fetchRemediation}
              disabled={remediation?.loading}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-[var(--primary)]/40 text-[var(--primary)] hover:bg-[var(--primary)]/10 smooth-transition disabled:opacity-50 cursor-pointer"
            >
              {remediation?.loading ? <CircularProgress size={12} color="inherit" /> : <Sparkles className="size-3.5" />}
              {remediation?.loading ? "Thinking…" : remediation?.text ? "Regenerate" : "Get AI Remediation"}
            </button>
          </div>
          {remediation?.error && <p className="mt-2 text-[11.5px] text-[var(--sev-critical)]">{remediation.error}</p>}
          {remediation?.text && (
            <p className="mt-2.5 text-[12.5px] leading-relaxed text-[var(--foreground)] whitespace-pre-line">
              <MarkdownLite text={remediation.text} />
            </p>
          )}
          {!remediation && (
            <p className="mt-2 text-[11.5px] text-[var(--muted-foreground)]">
              Generate remediation guidance grounded in this finding's CVE/CWE, severity, and threat intel.
            </p>
          )}
        </div>

        <div className="flex justify-end pb-4">
          {isRaised ? (
            <a
              href={ticket.issue_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white smooth-transition"
            >
              <Ticket className="size-3.5" /> #{ticket.issue_number} Raised
            </a>
          ) : (
            <button
              onClick={openTicketComposer}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[var(--primary-600)] hover:bg-[var(--primary-700)] text-[var(--primary-foreground)] smooth-transition cursor-pointer"
            >
              <Ticket className="size-3.5" />
              {isGithubConnected ? "Create Ticket" : "Connect GitHub to Create Ticket"}
            </button>
          )}
        </div>
      </div>

      <TicketComposerModal
        finding={finding}
        open={ticketDraft}
        onClose={() => setTicketDraft(false)}
        onSubmit={submitTicket}
        submitting={creating}
        initialOverview={aiOverview?.text}
      />
    </div>
  );
}
