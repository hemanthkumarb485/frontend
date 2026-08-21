import { useState } from "react";
import { useScan } from "../context/ScanContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { exportJSON, exportPDF, storeScanSession } from "../api/client";
import {
  DocumentArrowDownIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { getTierCounts } from "../utils/helpers";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { useNavigate } from "react-router-dom";
import { Alert, CircularProgress } from "@mui/material";

export default function Reports() {
  const { session } = useScan();
  const { user } = useAuth();
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);
  const [msg, setMsg] = useState(null);
  const [msgType, setMsgType] = useState("success");
  const [stored, setStored] = useState(false);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-[13px] text-[var(--muted-foreground)]">
          No scan data. Upload first.
        </p>
        <button
          onClick={() => navigate("/upload")}
          className="px-6 py-2 bg-[var(--primary-600)] hover:bg-[var(--primary-700)] text-[var(--primary-foreground)] rounded-md text-sm font-medium transition-all"
        >
          Upload Scans
        </button>
      </div>
    );
  }

  const tierCounts = getTierCounts(session.findings || []);

  const handle = async (type) => {
    setLoading(type);
    setMsg(null);
    try {
      if (type === "json") await exportJSON(session);
      else await exportPDF(session);
      setMsgType("success");
      setMsg(`${type.toUpperCase()} downloaded successfully!`);
    } catch (e) {
      setMsgType("error");
      setMsg(`Export failed: ${e.message}`);
    } finally {
      setLoading(null);
    }
  };

  const handleStore = async () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/reports" } } });
      return;
    }
    setLoading("store");
    setMsg(null);
    try {
      await storeScanSession(session);
      setStored(true);
      setMsgType("success");
      setMsg("Report stored — view it any time in Targets.");
    } catch (e) {
      setMsgType("error");
      setMsg(`Store failed: ${e.response?.data?.detail || e.message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-2 space-y-6">
      {/* Page Header */}
      <div className="border-b border-[var(--border)]/60 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Reports & Export
        </h1>
        <p className="mt-1.5 text-[13px] text-[var(--muted-foreground)]">
          Download the current scan session as JSON or PDF report.
        </p>
      </div>

      {/* Status Message */}
      {msg && (
        <Alert
          severity={msgType === "success" ? "success" : "error"}
          onClose={() => setMsg(null)}
          sx={{
            bgcolor:
              msgType === "success"
                ? isDark
                  ? "rgba(16, 185, 129, 0.1)"
                  : "#d1fae5"
                : isDark
                  ? "rgba(220, 38, 38, 0.1)"
                  : "#fee2e2",
            color:
              msgType === "success"
                ? isDark
                  ? "#6ee7b7"
                  : "#065f46"
                : isDark
                  ? "#fca5a5"
                  : "#991b1b",
            border: `1px solid ${
              msgType === "success"
                ? isDark
                  ? "rgba(16, 185, 129, 0.3)"
                  : "#6ee7b7"
                : isDark
                  ? "rgba(220, 38, 38, 0.3)"
                  : "#fca5a5"
            }`,
            borderRadius: "0.75rem",
          }}
        >
          {msg}
        </Alert>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Scan Session Summary */}
        <div className="lg:col-span-7">
          <Card className="w-full">
            <CardHeader
              title="Scan Session Summary"
              subtitle="Current analysis overview"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5 mt-4">
              {[
                ["Session ID", session.session_id?.slice(0, 12) + "\u2026"],
                ["Tools Used", session.tools_detected?.join(", ")],
                ["Total Findings", session.total_after_dedup],
                ["Scored Findings", session.total_scored],
                ["Unscored (No CVE)", session.total_unscored],
                [
                  "Processing Time",
                  session.processing_time_seconds
                    ? session.processing_time_seconds.toFixed(1) + "s"
                    : "\u2014",
                ],
                ["P0 Critical", tierCounts.P0],
                ["P1 High", tierCounts.P1],
                ["P2 Medium", tierCounts.P2],
                ["P3 Low", tierCounts.P3],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-1.5 text-[var(--muted-foreground)]">
                    {k}
                  </p>
                  <p className="text-[15px] font-extrabold text-[var(--foreground)] tracking-tight">
                    {String(v ?? "\u2014")}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Stacked Export Options */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Store Report */}
          <Card className="flex flex-col justify-between">
            <div className="flex items-start gap-4 mb-4">
              <div className="grid size-11 shrink-0 place-items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                {stored ? (
                  <CheckCircleIcon className="w-5 h-5 filter drop-shadow-[0_0_4px_rgba(16,185,129,0.4)]" />
                ) : (
                  <CloudArrowUpIcon className="w-5 h-5 filter drop-shadow-[0_0_4px_rgba(16,185,129,0.4)]" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[15px] text-[var(--foreground)]">Store Report</h3>
                <p className="text-[12.5px] mt-1 text-[var(--muted-foreground)]">
                  {user
                    ? "Save this scan to your account — view it any time in Targets."
                    : "Sign in to save this scan to your account and view it later in Targets."}
                </p>
              </div>
            </div>
            <Button
              onClick={handleStore}
              disabled={loading === "store" || stored}
              variant={stored ? "secondary" : "primary"}
              size="lg"
              className="w-full"
            >
              {loading === "store" ? (
                <>
                  <CircularProgress size={16} color="inherit" />
                  <span>Storing...</span>
                </>
              ) : stored ? (
                <span>Stored</span>
              ) : user ? (
                <span>Store Report</span>
              ) : (
                <span>Sign in to Store</span>
              )}
            </Button>
          </Card>

          {/* JSON Export */}
          <Card className="flex flex-col justify-between">
            <div className="flex items-start gap-4 mb-4">
              <div
                className="grid size-11 shrink-0 place-items-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.25)]"
              >
                <DocumentArrowDownIcon className="w-5 h-5 filter drop-shadow-[0_0_4px_rgba(168,85,247,0.4)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[15px] text-[var(--foreground)]">
                  JSON Export
                </h3>
                <p className="text-[12.5px] mt-1 text-[var(--muted-foreground)]">
                  Full structured data in JSON format — ideal for programmatic
                  processing and integrations.
                </p>
              </div>
            </div>
            <Button
              onClick={() => handle("json")}
              disabled={loading === "json"}
              variant={loading === "json" ? "secondary" : "primary"}
              size="lg"
              className="w-full"
            >
              {loading === "json" ? (
                <>
                  <CircularProgress size={16} color="inherit" />
                  <span>Generating...</span>
                </>
              ) : (
                <span>Download JSON</span>
              )}
            </Button>
          </Card>

          {/* PDF Export */}
          <Card className="flex flex-col justify-between">
            <div className="flex items-start gap-4 mb-4">
              <div
                className="grid size-11 shrink-0 place-items-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
              >
                <DocumentTextIcon className="w-5 h-5 filter drop-shadow-[0_0_4px_rgba(239,68,68,0.3)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[15px] text-[var(--foreground)]">
                  PDF Report
                </h3>
                <p className="text-[12.5px] mt-1 text-[var(--muted-foreground)]">
                  Professional formatted report with risk breakdown (top 100
                  findings included).
                </p>
              </div>
            </div>
            <Button
              onClick={() => handle("pdf")}
              disabled={loading === "pdf"}
              variant={loading === "pdf" ? "secondary" : "primary"}
              size="lg"
              className="w-full"
            >
              {loading === "pdf" ? (
                <>
                  <CircularProgress size={16} color="inherit" />
                  <span>Generating...</span>
                </>
              ) : (
                <span>Download PDF</span>
              )}
            </Button>
          </Card>
        </div>

        {/* Pro Tip Card - aligned with left column (col-span-7) */}
        <div className="lg:col-span-7">
          <div
            className="p-4 sm:p-5 rounded-lg border border-[var(--border)] glow-box smooth-transition"
            style={{ background: "var(--surface)" }}
          >
            <p className="text-[12.5px] leading-relaxed text-[var(--muted-foreground)]">
              <span className="font-semibold text-[var(--foreground)]">Pro Tip:</span> JSON exports are
              perfect for API integrations and bulk processing, while PDF reports
              are ideal for stakeholder communication and compliance documentation.
            </p>
          </div>
      </div>
    </div>
  </div>
  );
}
