import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClockIcon, DocumentTextIcon, ArrowDownTrayIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { CircularProgress } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { getSessionHistory, getReportDownloadUrl } from "../api/client";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { ToolBadge } from "../components/ui/Badge";

function fmtDateTime(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function SessionHistory() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const load = async () => {
    setErr(null);
    setLoading(true);
    try {
      const d = await getSessionHistory();
      setSessions(d.sessions || []);
    } catch (e) {
      setErr(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  // The backend already scopes /sessions to the caller's own JWT — there
  // was never anything to actually search for, so load automatically
  // instead of making a manual "paste your ID and search" step required
  // just to see your own history.
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const download = async (reportId) => {
    setDownloadingId(reportId);
    try {
      const r = await getReportDownloadUrl(reportId);
      window.open(r.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setErr(e.response?.data?.detail || e.message);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Session History"
          subtitle="When you uploaded scans, which tools were used, and when reports were generated."
        />
        <button
          onClick={load}
          disabled={loading}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-semibold border bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--accent)] smooth-transition cursor-pointer disabled:opacity-50 text-[var(--foreground)]"
        >
          <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <p className="text-[12px] text-[var(--muted-foreground)]">
        Your user ID: <span className="mono">{user?.id}</span> — also on your{" "}
        <Link to="/profile" className="text-[var(--primary)] hover:underline">Profile</Link> page.
      </p>

      {err && <p className="text-[12.5px] text-[var(--sev-critical)]">{err}</p>}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <CircularProgress size={26} />
        </div>
      )}

      {!loading && sessions && sessions.length === 0 && (
        <Card className="text-center py-10">
          <p className="text-[13px] text-[var(--muted-foreground)]">No stored scan sessions yet.</p>
        </Card>
      )}

      {!loading && sessions && sessions.length > 0 && (
        <div className="space-y-3">
          {sessions.map((s) => (
            <Card key={s.session_id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <ClockIcon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--muted-foreground)" }} />
                  <div>
                    <p className="text-[13px] font-semibold text-[var(--foreground)]">
                      {/* created_at is set by Postgres itself (now()) — always
                          correct UTC. scan_date is client-supplied and only a
                          fallback for older rows recorded before that was fixed. */}
                      Uploaded {fmtDateTime(s.created_at || s.scan_date)}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {(s.tools_detected || []).map((t) => (
                        <ToolBadge key={t} tool={t} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11.5px] text-[var(--muted-foreground)]">
                    {s.total_after_dedup} finding{s.total_after_dedup === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                {s.has_findings ? (
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-500">
                    ● Findings stored — visible in <Link to="/targets" className="hover:underline">Targets</Link>
                  </span>
                ) : (
                  <span className="text-[10.5px] font-semibold text-[var(--muted-foreground)]" title="Downloading a report doesn't persist findings — only the Store Report button on the Reports page does.">
                    ○ Not stored to Targets — this scan's findings weren't saved (only a report was generated)
                  </span>
                )}
              </div>
              <div className="mt-3 pt-3 border-t flex items-center justify-between gap-2" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--muted-foreground)" }} />
                  <p className="text-[11.5px] text-[var(--muted-foreground)]">
                    {s.report_generated_at
                      ? `PDF report generated ${fmtDateTime(s.report_generated_at)}`
                      : "No PDF report generated for this session"}
                  </p>
                </div>
                {s.report_id && (
                  <button
                    onClick={() => download(s.report_id)}
                    disabled={downloadingId === s.report_id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-semibold bg-[var(--surface-2)] border-[var(--border)] hover:bg-[var(--accent)] smooth-transition cursor-pointer text-[var(--foreground)] disabled:opacity-50 shrink-0"
                  >
                    {downloadingId === s.report_id ? (
                      <CircularProgress size={11} color="inherit" />
                    ) : (
                      <ArrowDownTrayIcon className="w-3 h-3" />
                    )}
                    Download PDF
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
