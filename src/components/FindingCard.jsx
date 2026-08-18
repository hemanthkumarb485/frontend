import { useState } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { TierBadge, SeverityBadge, ToolBadge } from "./ui/Badge";
import { RiskScorePill } from "./ui/RiskScorePill";
import { fmtScore, truncate, stripHtml } from "../utils/helpers";
import { Chip, Button, CircularProgress, Tooltip } from "@mui/material";
import {
  ConfirmationNumber as ConfirmationNumberIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

export function FindingCard({ finding, onRaiseTicket, raisedTicket }) {
  const [expanded, setExpanded] = useState(false);
  const f = finding;
  const asset = f.asset || {};
  const ti = f.threat_intel || {};
  const risk = f.risk_score || {};
  const host = asset.hostname || asset.ip || asset.domain || asset.url || "—";
  const isRaised = Boolean(raisedTicket && raisedTicket.status === "raised");
  const isCreating = raisedTicket?.status === "creating";
  const method = risk.scoring_method;

  return (
    <div
      className="rounded-xl overflow-hidden glow-box smooth-transition"
      style={{
        background: "var(--surface)",
      }}
    >
      <div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 cursor-pointer hover:bg-[var(--accent)] transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="shrink-0 text-[var(--muted-foreground)] mt-1">
            {expanded ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <TierBadge tier={risk.priority_tier || "UNSCORED"} />
              <SeverityBadge severity={f.severity} />
              <ToolBadge tool={f.source_tool} />
              {f.cvss?.base_score && (
                <Chip
                  label={`CVSS ${f.cvss.base_score}`}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    bgcolor: "#2563eb",
                    color: "white",
                  }}
                />
              )}
              {ti.is_kev && (
                <span
                  className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold"
                  style={{
                    color: "var(--sev-critical)",
                    background: "color-mix(in oklab, var(--sev-critical) 16%, transparent)",
                    border: "1px solid color-mix(in oklab, var(--sev-critical) 38%, transparent)",
                  }}
                >
                  KEV
                </span>
              )}
              {ti.has_public_exploit && (
                <span
                  className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold"
                  style={{
                    color: "var(--sev-high)",
                    background: "color-mix(in oklab, var(--sev-high) 16%, transparent)",
                    border: "1px solid color-mix(in oklab, var(--sev-high) 38%, transparent)",
                  }}
                >
                  Exploit
                </span>
              )}
            </div>
            <p className="text-[var(--foreground)] font-semibold text-[13px] mt-2 truncate">
              {f.vulnerability_name}
            </p>
            <p className="text-[var(--muted-foreground)] text-[12.5px] mt-1 flex items-center gap-2">
              <GlobeAltIcon className="w-3 h-3 shrink-0" />
              <span>{host}</span>
              {f.cve_id && (
                <span className="mono text-[var(--primary)] font-medium">
                  {f.cve_id}
                </span>
              )}
              {f.cwe_id && (
                <span className="mono text-[var(--muted-foreground)] font-medium">
                  {f.cwe_id}
                </span>
              )}
            </p>
          </div>
        </div>

        <div
          className="flex items-center justify-between md:justify-end gap-3 pl-7 md:pl-0 w-full md:w-auto flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 justify-end min-w-[110px]">
            {risk.final_score != null ? (
              <>
                <RiskScorePill score={risk.final_score} className="text-sm px-2.5 py-1" />
                <span className="text-[var(--muted-foreground)] text-[12.5px] whitespace-nowrap">/ 100</span>
              </>
            ) : (
              <span className="text-[var(--muted-foreground)] text-[13px] whitespace-nowrap">No score</span>
            )}
          </div>
          {isRaised ? (
            <Tooltip
              title={`Issue #${raisedTicket.issue_number} — click to open`}
              placement="top"
            >
              <a
                href={raisedTicket.issue_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Chip
                  icon={<CheckCircleIcon style={{ fontSize: 14 }} />}
                  label={`#${raisedTicket.issue_number} Raised`}
                  size="small"
                  sx={{
                    bgcolor: "#059669",
                    color: "white",
                    fontWeight: 700,
                    cursor: "pointer",
                    "&:hover": { bgcolor: "#047857" },
                  }}
                />
              </a>
            </Tooltip>
          ) : (
            <Tooltip
              title={
                onRaiseTicket ? "Create GitHub Issue" : "Connect GitHub first"
              }
              placement="top"
            >
              <span>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={!onRaiseTicket || isCreating}
                  startIcon={
                    isCreating ? (
                      <CircularProgress size={12} color="inherit" />
                    ) : (
                      <ConfirmationNumberIcon />
                    )
                  }
                  onClick={() => onRaiseTicket && onRaiseTicket(f)}
                  sx={{
                    fontSize: "0.65rem",
                    py: 0.5,
                    px: 1.2,
                    borderColor: "#2563eb",
                    color: "#2563eb",
                    "&:hover": {
                      bgcolor: "rgba(37, 99, 235, 0.08)",
                      borderColor: "#2563eb",
                    },
                    "&:disabled": {
                      borderColor: "#cbd5e1",
                      color: "#94a3b8",
                    },
                    whiteSpace: "nowrap",
                  }}
                >
                  {isCreating ? "Raising\u2026" : "Raise Ticket"}
                </Button>
              </span>
            </Tooltip>
          )}
        </div>
      </div>

      {expanded && (
        <div
          className="border-t p-4 space-y-4 text-sm"
          style={{
            borderColor: "var(--border)",
            background: "var(--accent)",
          }}
        >
          {risk.final_score != null && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {method === "cve_based" ? (
                [
                  {
                    label: "CVSS (40%)",
                    val: risk.cvss_component,
                    contrib: (risk.cvss_component || 0) * 0.4,
                  },
                  {
                    label: "KEV (25%)",
                    val: risk.kev_component,
                    contrib: (risk.kev_component || 0) * 0.25,
                  },
                  {
                    label: "EPSS (20%)",
                    val: risk.epss_component,
                    contrib: (risk.epss_component || 0) * 0.2,
                  },
                  {
                    label: "ExploitDB (15%)",
                    val: risk.exploitdb_component,
                    contrib: (risk.exploitdb_component || 0) * 0.15,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg p-3 border"
                    style={{
                      background: "var(--surface-2)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <p className="text-[12.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>
                      {item.label}
                    </p>
                    <p className="mono text-[var(--foreground)] font-bold mt-1">
                      {fmtScore(item.val)}
                    </p>
                    <p className="text-[var(--primary)] text-xs mt-1">
                      +{fmtScore(item.contrib)}
                    </p>
                  </div>
                ))
              ) : method === "cwe_estimated" ? (
                <div
                  className="col-span-2 sm:col-span-4 rounded-md p-3 border bg-[var(--accent)] border-[var(--border)]"
                >
                  <p className="text-[var(--primary)] text-xs font-semibold mb-1">
                    CWE-Estimated Score (no CVE)
                  </p>
                  <p className="text-[var(--foreground)] text-xs">
                    Severity×0.55 + CWE Top-25×0.30 + ExploitDB-count×0.15 ={" "}
                    <span className="text-[var(--primary)] font-bold">
                      {fmtScore(risk.cwe_component)}
                    </span>
                  </p>
                  <p className="text-[var(--muted-foreground)] text-xs mt-1">
                    Max tier: P1. P0 requires confirmed CVE+KEV/EPSS.
                  </p>
                </div>
              ) : null}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
            {[
              ["CVE", f.cve_id],
              ["CWE", f.cwe_id],
              ["CVSS Score", f.cvss?.base_score],
              [
                "EPSS",
                ti.epss_score ? (ti.epss_score * 100).toFixed(2) + "%" : null,
              ],
              ["Confidence", f.confidence],
              ["Port", asset.port],
              ["Protocol", asset.protocol],
              ["Service", asset.service_name],
              ["URL", asset.url],
            ]
              .filter(([, v]) => v != null && v !== "")
              .map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span
                    className="w-28 flex-shrink-0 font-medium"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {k}:
                  </span>
                  <span className="mono text-[var(--foreground)] break-all">
                    {String(v)}
                  </span>
                </div>
              ))}
          </div>
          {f.description && (
            <div>
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2"
                style={{ color: "var(--muted-foreground)" }}
              >
                Description
              </p>
              <p className="text-[var(--foreground)] text-xs leading-relaxed">
                {truncate(stripHtml(f.description), 400)}
              </p>
            </div>
          )}
          {f.solution && (
            <div>
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2"
                style={{ color: "var(--muted-foreground)" }}
              >
                Remediation
              </p>
              <p className="text-[var(--foreground)] text-xs leading-relaxed">
                {truncate(stripHtml(f.solution), 300)}
              </p>
            </div>
          )}
          {f.evidence && (
            <div>
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2"
                style={{ color: "var(--muted-foreground)" }}
              >
                Evidence
              </p>
              <pre
                className="mono rounded-lg p-3 text-xs text-emerald-700 dark:text-emerald-300 overflow-x-auto whitespace-pre-wrap border"
                style={{
                  background: "var(--surface-2)",
                  borderColor: "var(--border)",
                }}
              >
                {truncate(f.evidence, 500)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
