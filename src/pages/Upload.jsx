import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpTrayIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useScan } from "../context/ScanContext";
import { useTheme } from "../context/ThemeContext";
import { uploadScansSSE } from "../api/client";
import { ProgressBar } from "../components/ProgressBar";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { clsx } from "clsx";

const TOOLS = [
  {
    key: "zap",
    label: "OWASP ZAP",
    color: "blue",
    formats: ["auto", "sarif", "xml", "json"],
    accept: ".json,.xml,.html,.pdf,.txt",
  },
  {
    key: "nuclei",
    label: "Nuclei",
    color: "purple",
    formats: ["auto", "jsonl", "json", "sarif", "markdown"],
    accept: ".jsonl,.json,.md,.sarif,.pdf",
  },
  {
    key: "openvas",
    label: "OpenVAS",
    color: "cyan",
    formats: ["xml"],
    accept: ".xml,.pdf,.txt",
  },
  {
    key: "nmap",
    label: "Nmap",
    color: "emerald",
    formats: ["auto", "xml", "normal", "grepable"],
    accept: ".xml,.txt,.gnmap,.pdf",
  },
];
const CRITS = [
  { value: "production", label: "🔴 Production ×1.2" },
  { value: "staging", label: "🟡 Staging ×1.0" },
  { value: "development", label: "🟢 Dev ×0.8" },
  { value: "unknown", label: "⚪ Unknown ×1.0" },
];

const colorClasses = {
  blue: {
    border: "border-blue-600/40",
    bg: "bg-blue-600/10",
    text: "text-blue-600 dark:text-blue-400",
    highlight: "dark:ring-blue-500/30",
  },
  purple: {
    border: "border-purple-600/40",
    bg: "bg-purple-600/10",
    text: "text-purple-600 dark:text-purple-400",
    highlight: "dark:ring-purple-500/30",
  },
  cyan: {
    border: "border-cyan-600/40",
    bg: "bg-cyan-600/10",
    text: "text-cyan-600 dark:text-cyan-400",
    highlight: "dark:ring-cyan-500/30",
  },
  emerald: {
    border: "border-emerald-600/40",
    bg: "bg-emerald-600/10",
    text: "text-emerald-600 dark:text-emerald-400",
    highlight: "dark:ring-emerald-500/30",
  },
};

function Zone({ mode, tool, file, format, onFile, onFormat, onClear }) {
  const ref = useRef(null);
  const [drag, setDrag] = useState(false);
  const isDark = mode === "dark";
  const colorClass = colorClasses[tool.color];

  return (
    <div
      className={clsx(
        "rounded-xl p-5 border smooth-transition",
        isDark
          ? "bg-slate-900/30 border-slate-800/50"
          : "bg-slate-50 border-slate-200",
        drag &&
          (isDark
            ? "ring-2 ring-primary-500/50 border-primary-500/30"
            : "ring-2 ring-primary-500/30 border-primary-500/20"),
      )}
    >
      <div className="flex justify-between items-center mb-4">
        <span className={clsx("font-semibold text-sm", colorClass.text)}>
          {tool.label}
        </span>
        {file && (
          <button
            onClick={onClear}
            className={`transition-colors ${isDark ? "text-slate-400 hover:text-red-400" : "text-slate-500 hover:text-red-600"}`}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {!file ? (
        <div
          className={clsx(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer smooth-transition",
            isDark
              ? "border-slate-700 hover:border-slate-600 hover:bg-slate-800/20"
              : "border-slate-300 hover:border-slate-400 hover:bg-slate-100",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const f = e.dataTransfer.files[0];
            if (f) onFile(f);
          }}
          onClick={() => ref.current?.click()}
        >
          <ArrowUpTrayIcon
            className={clsx("w-8 h-8 mx-auto mb-2", colorClass.text)}
          />
          <p
            className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}
          >
            Drop your file here
          </p>
          <p
            className={`text-xs mt-1 ${isDark ? "text-slate-500" : "text-slate-600"}`}
          >
            or click to browse
          </p>
          <input
            ref={ref}
            type="file"
            accept={tool.accept}
            className="hidden"
            onChange={(e) => onFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div
          className={clsx(
            "flex items-center gap-3 rounded-lg p-3 border",
            isDark
              ? "bg-slate-800/50 border-slate-700/30"
              : "bg-slate-100/50 border-slate-200",
          )}
        >
          <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium truncate ${isDark ? "text-slate-200" : "text-slate-900"}`}
            >
              {file.name}
            </p>
            <p
              className={`text-xs mt-0.5 ${isDark ? "text-slate-500" : "text-slate-600"}`}
            >
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>
      )}

      <div className="mt-4">
        <label
          className={`text-xs font-semibold mb-2 block ${isDark ? "text-slate-400" : "text-slate-700"}`}
        >
          Format
        </label>
        <select
          value={format}
          onChange={(e) => onFormat(e.target.value)}
          className={clsx(
            "w-full rounded-lg px-3 py-2 text-sm font-medium border smooth-transition focus:outline-none focus:ring-2 focus:ring-primary-500/50",
            isDark
              ? "bg-slate-800 border-slate-700 text-slate-200"
              : "bg-white border-slate-300 text-slate-900",
          )}
        >
          {tool.formats.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function Upload() {
  const navigate = useNavigate();
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const {
    setSession,
    setIsProcessing,
    setProgress,
    setError,
    isProcessing,
    progress,
  } = useScan();
  const [files, setFiles] = useState({
    zap: null,
    nuclei: null,
    openvas: null,
    nmap: null,
  });
  const [fmts, setFmts] = useState({
    zap: "auto",
    nuclei: "auto",
    openvas: "xml",
    nmap: "auto",
  });
  const [crit, setCrit] = useState("unknown");
  const hasFiles = Object.values(files).some(Boolean);

  const submit = () => {
    if (!hasFiles) return;
    setIsProcessing(true);
    setProgress({
      stage: "start",
      percent: 0,
      message: "Starting...",
      elapsed_seconds: 0,
    });
    setError(null);
    uploadScansSSE(
      {
        zap_file: files.zap,
        zap_format: fmts.zap,
        nuclei_file: files.nuclei,
        nuclei_format: fmts.nuclei,
        openvas_file: files.openvas,
        openvas_format: fmts.openvas,
        nmap_file: files.nmap,
        nmap_format: fmts.nmap,
        asset_criticality: crit,
      },
      (p) => setProgress(p),
      (data) => {
        setSession(data);
        setIsProcessing(false);
        setProgress(null);
        navigate("/");
      },
      (err) => {
        setError(String(err));
        setIsProcessing(false);
        setProgress(null);
      },
    );
  };

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <h1
          className={`text-3xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}
        >
          Upload Scan Results
        </h1>
        <p
          className={`text-base mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}
        >
          Supports OWASP ZAP, Nuclei, OpenVAS & Nmap — all formats, max 1 GB per
          file.
        </p>
      </div>

      {/* Asset Criticality */}
      <Card>
        <CardHeader
          title="Asset Criticality Level"
          subtitle="Affects risk scoring multiplier"
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CRITS.map((o) => (
            <button
              key={o.value}
              onClick={() => setCrit(o.value)}
              className={clsx(
                "px-4 py-2.5 rounded-lg text-sm font-medium border-2 smooth-transition",
                crit === o.value
                  ? "bg-linear-to-r from-primary-600 to-primary-700 border-primary-700 text-white shadow-md shadow-primary-600/20"
                  : isDark
                    ? "bg-slate-800/30 border-slate-700/30 text-slate-400 hover:border-slate-600/50 hover:bg-slate-800/50"
                    : "bg-slate-100 border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-200",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Card>

      {/* File Upload Zones */}
      <div>
        <h2
          className={`text-lg font-semibold mb-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}
        >
          Upload Scanner Results
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TOOLS.map((t) => (
            <Zone
              key={t.key}
              mode={mode}
              tool={t}
              file={files[t.key]}
              format={fmts[t.key]}
              onFile={(f) => setFiles((p) => ({ ...p, [t.key]: f }))}
              onFormat={(fmt) => setFmts((p) => ({ ...p, [t.key]: fmt }))}
              onClear={() => setFiles((p) => ({ ...p, [t.key]: null }))}
            />
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      {progress && <ProgressBar progress={progress} />}

      {/* Submit Button */}
      <Button
        onClick={submit}
        disabled={!hasFiles || isProcessing}
        variant="primary"
        size="lg"
        className="w-full"
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Processing Scans...</span>
          </>
        ) : (
          <>
            <span>🚀</span>
            <span>Analyze & Prioritize Findings</span>
          </>
        )}
      </Button>

      <p
        className={`text-xs text-center ${isDark ? "text-slate-500" : "text-slate-600"}`}
      >
        Your scans are processed securely. No data is stored after analysis.
      </p>
    </div>
  );
}
