import { useState } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { TierBadge, SeverityBadge, ToolBadge } from "./ui/Badge";
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
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/50 rounded-xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700/50 transition-all duration-200 shadow-sm dark:shadow-lg hover:shadow-md dark:hover:shadow-xl hover:shadow-slate-900/5 dark:hover:shadow-slate-900/20">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="shrink-0 text-slate-400 dark:text-slate-500">
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
                  bgcolor: "rgb(99, 102, 241)",
                  color: "white",
                }}
              />
            )}
            {ti.is_kev && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-600/20 text-red-700 dark:bg-red-600/30 dark:text-red-300 ring-1 ring-red-600/40 dark:ring-red-600/60">
                🚨 KEV
              </span>
            )}
            {ti.has_public_exploit && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-600/20 text-orange-700 dark:bg-orange-600/30 dark:text-orange-300 ring-1 ring-orange-600/40 dark:ring-orange-600/60">
                💣 Exploit
              </span>
            )}
          </div>
          <p className="text-slate-900 dark:text-slate-100 font-semibold text-sm mt-2 truncate">
            {f.vulnerability_name}
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 flex items-center gap-2">
            <GlobeAltIcon className="w-3 h-3 shrink-0" />
            <span>{host}</span>
            {f.cve_id && (
              <span className="text-primary-600 dark:text-primary-400 font-medium">
                {f.cve_id}
              </span>
            )}
            {f.cwe_id && (
              <span className="text-secondary-600 dark:text-secondary-400 font-medium">
                {f.cwe_id}
              </span>
            )}
          </p>
        </div>

        <div
          className="flex-shrink-0 flex items-center gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-right">
            {risk.final_score != null ? (
              <>
                <p className="text-2xl font-bold bg-linear-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  {fmtScore(risk.final_score)}
                </p>
                <p className="text-slate-500 text-xs">/ 100</p>
              </>
            ) : (
              <p className="text-slate-500 text-sm">No score</p>
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
                    bgcolor: "rgb(16, 185, 129)",
                    color: "white",
                    fontWeight: 700,
                    cursor: "pointer",
                    "&:hover": { bgcolor: "rgb(5, 150, 105)" },
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
                    borderColor: "rgb(88, 68, 255)",
                    color: "rgb(88, 68, 255)",
                    "&:hover": {
                      bgcolor: "rgba(88, 68, 255, 0.08)",
                      borderColor: "rgb(88, 68, 255)",
                    },
                    "&:disabled": {
                      borderColor: "rgb(203, 213, 225)",
                      color: "rgb(148, 163, 184)",
                    },
                    whiteSpace: "nowrap",
                  }}
                >
                  {isCreating ? "Raising…" : "Raise Ticket"}
                </Button>
              </span>
            </Tooltip>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-200 dark:border-slate-800/50 p-4 space-y-4 text-sm bg-slate-50/50 dark:bg-slate-800/20">
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
                    className="bg-white dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700/30"
                  >
                    <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                      {item.label}
                    </p>
                    <p className="text-slate-900 dark:text-slate-100 font-bold mt-1">
                      {fmtScore(item.val)}
                    </p>
                    <p className="text-primary-600 dark:text-primary-400 text-xs mt-1">
                      +{fmtScore(item.contrib)}
                    </p>
                  </div>
                ))
              ) : method === "cwe_estimated" ? (
                <div className="col-span-2 sm:col-span-4 bg-secondary-50 dark:bg-secondary-600/10 border border-secondary-200 dark:border-secondary-600/30 rounded-lg p-3">
                  <p className="text-secondary-700 dark:text-secondary-300 text-xs font-semibold mb-1">
                    CWE-Estimated Score (no CVE)
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 text-xs">
                    Severity×0.55 + CWE Top-25×0.30 + ExploitDB-count×0.15 ={" "}
                    <span className="text-primary-600 dark:text-primary-400 font-bold">
                      {fmtScore(risk.cwe_component)}
                    </span>
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                    Max tier: P1. P0 requires confirmed CVE+KEV/EPSS.
                  </p>
                </div>
              ) : null}
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
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
                  <span className="text-slate-600 dark:text-slate-400 w-28 flex-shrink-0 font-medium">
                    {k}:
                  </span>
                  <span className="text-slate-900 dark:text-slate-200 break-all">
                    {String(v)}
                  </span>
                </div>
              ))}
          </div>
          {f.description && (
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-xs uppercase font-semibold mb-2">
                Description
              </p>
              <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                {truncate(stripHtml(f.description), 400)}
              </p>
            </div>
          )}
          {f.solution && (
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-xs uppercase font-semibold mb-2">
                Remediation
              </p>
              <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                {truncate(stripHtml(f.solution), 300)}
              </p>
            </div>
          )}
          {f.evidence && (
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-xs uppercase font-semibold mb-2">
                Evidence
              </p>
              <pre className="bg-slate-100 dark:bg-slate-950 rounded-lg p-3 text-xs text-emerald-700 dark:text-emerald-300 overflow-x-auto whitespace-pre-wrap border border-slate-200 dark:border-slate-800">
                {truncate(f.evidence, 500)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
