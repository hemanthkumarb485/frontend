import { useState } from "react";
import { Link } from "react-router-dom";
import { MagnifyingGlassIcon, ClockIcon, DocumentTextIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
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
  const [uuidInput, setUuidInput] = useState(user?.id || "");
  const [sessions, setSessions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

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

  const search = async (e) => {
    e.preventDefault();
    setErr(null);
    const trimmed = uuidInput.trim();
    if (trimmed !== user.id) {
      setErr("You can only search your own user ID — this doesn't match your account.");
      setSessions(null);
      return;
    }
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

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Session History"
        subtitle="Search by your user ID to see when you uploaded scans, which tools were used, and when reports were generated."
      />

      <form onSubmit={search} className="flex flex-col sm:flex-row gap-2">
        <div
          className="relative flex-1 px-4 py-2.5 rounded-lg border smooth-transition focus-within:border-[var(--primary)]/40"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            value={uuidInput}
            onChange={(e) => setUuidInput(e.target.value)}
            placeholder="Your user ID (UUID)"
            className="mono w-full pl-7 bg-transparent text-[13px] focus:outline-none text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-[var(--primary-600)] hover:bg-[var(--primary-700)] text-[var(--primary-foreground)] smooth-transition cursor-pointer disabled:opacity-50"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

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
