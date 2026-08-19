import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { ExpandMore, ChevronRight } from "@mui/icons-material";
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

const accordionSx = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "10px !important",
  "&:before": { display: "none" },
  boxShadow: "none",
};

/**
 * Two-level accordion: Asset -> Vulnerability Type, with each unique path
 * as a clickable row that navigates to the finding's own detail page.
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
                return (
                  <Accordion
                    key={typeKey}
                    sx={accordionSx}
                    expanded={expandedType === typeKey}
                    onChange={() => setExpandedType((k) => (k === typeKey ? null : typeKey))}
                  >
                    <AccordionSummary expandIcon={<ExpandMore sx={{ color: "var(--muted-foreground)" }} />}>
                      <div className="flex items-center gap-3 min-w-0 flex-wrap">
                        <span className="font-medium text-[13px] text-[var(--foreground)] truncate">{type}</span>
                        <SeverityBadge severity={items[0]?.severity} />
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)]">
                          {items.length} path{items.length === 1 ? "" : "s"}
                        </span>
                      </div>
                    </AccordionSummary>
                    <AccordionDetails sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 0 }}>
                      {items.map((f) => {
                        const risk = f.risk_score || {};
                        return (
                          <button
                            key={f.finding_id}
                            onClick={() => navigate(`/findings/${f.finding_id}`)}
                            className="flex items-center gap-3 min-w-0 w-full rounded-lg border p-3 text-left hover:border-[var(--primary)]/40 hover:bg-[var(--accent)]/40 smooth-transition cursor-pointer"
                            style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
                          >
                            <span className="mono text-[12.5px] text-[var(--foreground)] truncate flex-1 min-w-0">{pathOf(f)}</span>
                            <ToolBadge tool={f.source_tool} />
                            {risk.final_score != null && <RiskScorePill score={risk.final_score} />}
                            <TierBadge tier={risk.priority_tier || "UNSCORED"} />
                            <ChevronRight sx={{ fontSize: 16, color: "var(--muted-foreground)" }} />
                          </button>
                        );
                      })}
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
