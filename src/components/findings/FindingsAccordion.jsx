import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { ExternalLink } from "lucide-react";
import { SeverityBadge, ToolBadge, TierBadge } from "../ui/Badge";
import { RiskScorePill } from "../ui/RiskScorePill";

function hostOf(f) {
  const a = f.asset || {};
  return a.hostname || a.ip || a.domain || a.url || "Unknown";
}

function pathOf(f) {
  const a = f.asset || {};
  return a.path || a.url || "—";
}

function typeOf(f) {
  return f.finding_type || f.vulnerability_name || "Uncategorized";
}

// Callers attach _scannedAt: the finding's own persisted created_at when
// available (TargetDetail, from stored data), or the current session's
// scan_date as a shared fallback (live Findings page — CanonicalFinding
// itself carries no per-finding timestamp, only the session does).
function scannedAtOf(f) {
  if (!f._scannedAt) return null;
  try {
    return new Date(f._scannedAt).toLocaleString(undefined, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return f._scannedAt;
  }
}

const accordionSx = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "10px !important",
  "&:before": { display: "none" },
  boxShadow: "none",
};

/**
 * Two-level accordion: Asset -> Vulnerability Type, with each unique path
 * as a row showing a quick summary (tool, score, tier) plus an explicit
 * "View" button that navigates to the finding's own detail page.
 */
export default function FindingsAccordion({ findings = [] }) {
  const navigate = useNavigate();
  const [expandedHost, setExpandedHost] = useState(null);
  const [expandedType, setExpandedType] = useState(null);

  const grouped = useMemo(() => {
    const byHost = {};
    for (const f of findings) {
      const host = hostOf(f);
      const type = typeOf(f);
      byHost[host] ??= {};
      byHost[host][type] ??= [];
      byHost[host][type].push(f);
    }
    return byHost;
  }, [findings]);

  const hosts = Object.keys(grouped);

  if (hosts.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--muted-foreground)] border border-dashed border-[var(--border)] rounded-xl bg-[var(--surface)]">
        <p className="text-[13px] font-semibold">No findings match your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hosts.map((host) => {
        const typeMap = grouped[host];
        const hostFindingCount = Object.values(typeMap).reduce((n, arr) => n + arr.length, 0);

        return (
          <Accordion
            key={host}
            sx={accordionSx}
            expanded={expandedHost === host}
            onChange={() => setExpandedHost((h) => (h === host ? null : host))}
          >
            <AccordionSummary expandIcon={<ExpandMore sx={{ color: "var(--muted-foreground)" }} />}>
              <div className="flex items-center gap-3 min-w-0">
                <span className="mono font-semibold text-[13.5px] text-[var(--foreground)] truncate">{host}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)]">
                  {hostFindingCount} finding{hostFindingCount === 1 ? "" : "s"}
                </span>
              </div>
            </AccordionSummary>
            <AccordionDetails sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 0 }}>
              {Object.entries(typeMap).map(([type, items]) => {
                const typeKey = `${host}::${type}`;
                // Some finding types (header checks, generic network flags)
                // carry no path/URL at all — every occurrence is otherwise
                // identical, so a full bordered row + its own "View" button
                // per occurrence was N repeats of the same button. Every
                // timestamp still needs to stay visible (it's the scan
                // history), so those types get one card listing every scan
                // time plus a single shared "View" (most recent instance)
                // instead. Types that DO have a real path per item (e.g.
                // reflected XSS on distinct URLs) keep the per-row layout,
                // since those rows are genuinely different findings.
                const hasAnyPath = items.some((f) => pathOf(f) !== "—");
                const sortedByRecency = hasAnyPath
                  ? items
                  : [...items].sort((a, b) => new Date(b._scannedAt || 0) - new Date(a._scannedAt || 0));

                return (
                  <Accordion
                    key={typeKey}
                    sx={accordionSx}
                    expanded={expandedType === typeKey}
                    onChange={() => setExpandedType((k) => (k === typeKey ? null : typeKey))}
                  >
                    <AccordionSummary expandIcon={<ExpandMore sx={{ color: "var(--muted-foreground)" }} />}>
                      <div className="flex items-center gap-3 min-w-0 flex-wrap w-full">
                        <span className="font-medium text-[13px] text-[var(--foreground)] truncate">{type}</span>
                        <SeverityBadge severity={items[0]?.severity} />
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)]">
                          {hasAnyPath
                            ? `${items.length} path${items.length === 1 ? "" : "s"}`
                            : `seen ${items.length} time${items.length === 1 ? "" : "s"}`}
                        </span>
                        {/* Tool/score/tier are the same for every path under this
                            vulnerability type — shown here too so they're visible
                            without expanding, matching what each row already shows. */}
                        <ToolBadge tool={items[0]?.source_tool} />
                        {items[0]?.risk_score?.final_score != null && (
                          <RiskScorePill score={items[0].risk_score.final_score} />
                        )}
                        <TierBadge tier={items[0]?.risk_score?.priority_tier || "UNSCORED"} />
                        {/* Pathless types (no per-instance page worth linking to
                            individually) get their single shared "View" right in
                            the header, visible without expanding — stopPropagation
                            so clicking it doesn't also toggle the accordion. */}
                        {!hasAnyPath && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/findings/${sortedByRecency[0].finding_id}`);
                            }}
                            className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded border text-[11px] font-semibold bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--accent)] smooth-transition cursor-pointer text-[var(--foreground)] shrink-0"
                          >
                            <ExternalLink className="size-3" /> View
                          </button>
                        )}
                      </div>
                    </AccordionSummary>
                    <AccordionDetails sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 0 }}>
                      {hasAnyPath ? (
                        sortedByRecency.map((f) => {
                          const scannedAt = scannedAtOf(f);
                          return (
                            <div
                              key={f.finding_id}
                              className="flex items-center gap-3 min-w-0 w-full rounded-lg border p-3"
                              style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="mono text-[12.5px] text-[var(--foreground)] truncate">{pathOf(f)}</p>
                                {scannedAt && (
                                  <p className="text-[10.5px] text-[var(--muted-foreground)] mt-0.5">Scanned {scannedAt}</p>
                                )}
                              </div>
                              {/* Tool/score/tier are shown once on the group header
                                  above (they're identical for every path in this
                                  type) — repeating them on each row was clutter. */}
                              <button
                                onClick={() => navigate(`/findings/${f.finding_id}`)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded border text-[11px] font-semibold bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--accent)] smooth-transition cursor-pointer text-[var(--foreground)] shrink-0"
                              >
                                <ExternalLink className="size-3" /> View
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        // One full-width row per scan, matching the per-path row
                        // style — just the timestamp, no "—" placeholder. The
                        // single shared "View" for this group lives up in the
                        // header instead (visible without expanding at all).
                        sortedByRecency.map((f) => {
                          const scannedAt = scannedAtOf(f);
                          if (!scannedAt) return null;
                          return (
                            <div
                              key={f.finding_id}
                              className="w-full rounded-lg border p-3"
                              style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
                            >
                              <p className="text-[13px] font-semibold text-[var(--foreground)]">Scanned {scannedAt}</p>
                            </div>
                          );
                        })
                      )}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </div>
  );
}
