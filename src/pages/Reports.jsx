import { useState } from "react";
import { useScan } from "../context/ScanContext";
import { useTheme } from "../context/ThemeContext";
import { exportJSON, exportPDF } from "../api/client";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { getTierCounts } from "../utils/helpers";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { Alert, CircularProgress } from "@mui/material";

export default function Reports() {
  const { session } = useScan();
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);
  const [msg, setMsg] = useState(null);
  const [msgType, setMsgType] = useState("success");

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p
          className={`text-base ${isDark ? "text-slate-400" : "text-slate-600"}`}
        >
          No scan data. Upload first.
        </p>
        <button
          onClick={() => navigate("/upload")}
          className="px-6 py-2 bg-linear-to-r from-primary-600 to-primary-700 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
        >
          📤 Upload Scans
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
      setMsg(`✅ ${type.toUpperCase()} downloaded successfully!`);
    } catch (e) {
      setMsgType("error");
      setMsg(`❌ Export failed: ${e.message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1
          className={`text-3xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}
        >
          Reports & Export
        </h1>
        <p
          className={`text-base mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}
        >
          Download the current scan session as JSON or PDF report.
        </p>
      </div>

      {/* Session Summary */}
      <Card>
        <CardHeader
          title="Scan Session Summary"
          subtitle="Current analysis overview"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
          {[
            ["Session ID", session.session_id?.slice(0, 12) + "…"],
            ["Tools Used", session.tools_detected?.join(", ")],
            ["Total Findings", session.total_after_dedup],
            ["Scored Findings", session.total_scored],
            ["Unscored (No CVE)", session.total_unscored],
            [
              "Processing Time",
              session.processing_time_seconds
                ? session.processing_time_seconds.toFixed(1) + "s"
                : "—",
            ],
            ["🔴 P0 Critical", tierCounts.P0],
            ["🟠 P1 High", tierCounts.P1],
            ["🟡 P2 Medium", tierCounts.P2],
            ["🟢 P3 Low", tierCounts.P3],
          ].map(([k, v]) => (
            <div key={k}>
              <p
                className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isDark ? "text-slate-500" : "text-slate-600"}`}
              >
                {k}
              </p>
              <p
                className={`text-sm font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}
              >
                {String(v ?? "—")}
              </p>
            </div>
          ))}
        </div>
      </Card>

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

      {/* Export Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* JSON Export */}
        <Card>
          <div className="flex items-start gap-4 mb-4">
            <div
              className={`p-3 rounded-lg flex-shrink-0 ${isDark ? "bg-blue-600/20 text-blue-400" : "bg-blue-100 text-blue-600"}`}
            >
              <DocumentArrowDownIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3
                className={`font-bold text-lg ${isDark ? "text-slate-200" : "text-slate-900"}`}
              >
                JSON Export
              </h3>
              <p
                className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
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
              <>
                <span>⬇️</span>
                <span>Download JSON</span>
              </>
            )}
          </Button>
        </Card>

        {/* PDF Export */}
        <Card>
          <div className="flex items-start gap-4 mb-4">
            <div
              className={`p-3 rounded-lg flex-shrink-0 ${isDark ? "bg-red-600/20 text-red-400" : "bg-red-100 text-red-600"}`}
            >
              <DocumentArrowDownIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3
                className={`font-bold text-lg ${isDark ? "text-slate-200" : "text-slate-900"}`}
              >
                PDF Report
              </h3>
              <p
                className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
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
              <>
                <span>📄</span>
                <span>Download PDF</span>
              </>
            )}
          </Button>
        </Card>
      </div>

      {/* Footer Note */}
      <div
        className={`p-4 rounded-lg border ${isDark ? "bg-slate-900/30 border-slate-800/50" : "bg-slate-50 border-slate-200"}`}
      >
        <p
          className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
        >
          💡 <span className="font-medium">Pro Tip:</span> JSON exports are
          perfect for API integrations and bulk processing, while PDF reports
          are ideal for stakeholder communication and compliance documentation.
        </p>
      </div>
    </div>
  );
}
