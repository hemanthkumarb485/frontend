import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Server } from "lucide-react";
import { CircularProgress, Alert } from "@mui/material";
import { getTargetFindings } from "../api/client";
import FindingsAccordion from "../components/findings/FindingsAccordion";
import { fmtDate } from "../utils/helpers";

export default function TargetDetail() {
  const { host } = useParams();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    setLoading(true);
    setErr(null);
    getTargetFindings(host)
      .then((d) => setRows(d.findings || []))
      .catch((e) => setErr(e.response?.data?.detail || e.message))
      .finally(() => setLoading(false));
  }, [host]);

  const findings = useMemo(
    () => rows.map((r) => ({ ...r.data, _scannedAt: r.created_at })),
    [rows]
  );

  const scanDates = useMemo(() => {
    const dates = new Set(rows.map((r) => (r.created_at || "").slice(0, 10)).filter(Boolean));
    return Array.from(dates).sort().reverse();
  }, [rows]);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/targets")}
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] smooth-transition cursor-pointer"
      >
        <ArrowLeft className="size-3.5" /> Back to Targets
      </button>

      <div>
        <div className="flex items-center gap-2.5">
          <Server className="size-5 shrink-0" style={{ color: "var(--muted-foreground)" }} />
          <h1 className="mono text-xl font-bold tracking-tight text-[var(--foreground)]">{host}</h1>
        </div>
        <p className="mt-1.5 text-[13px] text-[var(--muted-foreground)]">
          {loading ? "Loading…" : `${findings.length} finding${findings.length === 1 ? "" : "s"} across your scan history`}
          {scanDates.length > 0 && ` · scanned ${scanDates.length} time${scanDates.length === 1 ? "" : "s"}, last on ${fmtDate(scanDates[0])}`}
        </p>
      </div>

      {err && (
        <Alert severity="error" sx={{ bgcolor: "rgba(220,38,38,0.1)", color: "#fca5a5", border: "1px solid rgba(220,38,38,0.3)" }}>
          {err}
        </Alert>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <CircularProgress size={28} />
        </div>
      )}

      {!loading && !err && findings.length === 0 && (
        <div className="text-center py-16 text-[var(--muted-foreground)] border border-dashed border-[var(--border)] rounded-xl bg-[var(--surface)]">
          <p className="text-[13px] font-semibold">No persisted findings for this target.</p>
        </div>
      )}

      {!loading && !err && findings.length > 0 && <FindingsAccordion findings={findings} />}
    </div>
  );
}
