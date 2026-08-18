import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpTrayIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useScan } from "../context/ScanContext";
import { useTheme } from "../context/ThemeContext";
import { uploadScansSSE } from "../api/client";
import { ProgressBar } from "../components/ProgressBar";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { clsx } from "clsx";

const TOOLS = [
  {
    key: "zap",
    label: "OWASP ZAP",
    color: "blue",
    formats: ["auto", "sarif", "xml", "json"],
    accept: ".json,.xml,.sarif",
  },
  {
    key: "nuclei",
    label: "Nuclei",
    color: "purple",
    formats: ["auto", "jsonl", "json", "sarif", "markdown"],
    accept: ".jsonl,.json,.sarif,.md",
  },
  {
    key: "openvas",
    label: "OpenVAS",
    color: "cyan",
    formats: ["xml"],
    accept: ".xml",
  },
  {
    key: "nmap",
    label: "Nmap",
    color: "emerald",
    formats: ["auto", "xml", "normal", "grepable"],
    accept: ".xml,.txt,.gnmap",
  },
];
const CRITS = [
  { value: "production", label: "Production x1.2" },
  { value: "staging", label: "Staging x1.0" },
  { value: "development", label: "Dev x0.8" },
  { value: "unknown", label: "Unknown x1.0" },
];

const colorClasses = {
  blue: {
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    highlight: "dark:ring-blue-500/30",
  },
  purple: {
    border: "border-purple-500/30",
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    highlight: "dark:ring-purple-500/30",
  },
  cyan: {
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/10",
    text: "text-cyan-600 dark:text-cyan-400",
    highlight: "dark:ring-cyan-500/30",
  },
  emerald: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
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
        "rounded-md p-5 border smooth-transition",
        drag && "ring-2 ring-[var(--primary)]/40 border-[var(--primary)]/30"
      )}
      style={{
        background: "var(--surface)",
        borderColor: drag ? undefined : "var(--border)",
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <span className={clsx("font-semibold text-[13px]", colorClass.text)}>
          {tool.label}
        </span>
        {file && (
          <button
            onClick={onClear}
            className="transition-colors text-[var(--muted-foreground)] hover:text-red-500"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {!file ? (
        <div
          className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer smooth-transition hover:bg-[var(--accent)]"
          style={{
            borderColor: isDark ? "#2f3542" : "#d1d5db",
          }}
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
          <p className="text-[13px] font-medium text-[var(--foreground)]">
            Drop your file here
          </p>
          <p className="text-xs mt-1 text-[var(--muted-foreground)]">
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
          className="flex items-center gap-3 rounded-md p-3 border"
          style={{
            background: "var(--accent)",
            borderColor: "var(--border)",
          }}
        >
          <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium truncate text-[var(--foreground)]">
              {file.name}
            </p>
            <p className="text-xs mt-0.5 text-[var(--muted-foreground)]">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>
      )}

      <div className="mt-4">
        <label className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2 block text-[var(--muted-foreground)]">
          Format
        </label>
        <select
          value={format}
          onChange={(e) => onFormat(e.target.value)}
          className="w-full rounded-md px-3 py-2 text-sm font-medium border smooth-transition focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/50"
          style={{
            background: "var(--surface-2)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
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
  const [toastError, setToastError] = useState(null);
  const hasFiles = Object.values(files).some(Boolean);

  const showToast = (msg) => {
    setToastError(msg);
    setTimeout(() => {
      setToastError((current) => current === msg ? null : current);
    }, 5000);
  };

  const handleFileChange = (toolKey, file) => {
    if (!file) return;

    const tool = TOOLS.find((t) => t.key === toolKey);
    if (!tool) return;

    // 1. Validate file extension
    const ext = "." + file.name.split('.').pop().toLowerCase();
    const allowedExts = tool.accept.split(',');
    if (!allowedExts.includes(ext)) {
      showToast(`Invalid file format for ${tool.label}. Only ${tool.accept} are allowed.`);
      return;
    }

    // 2. Add file to files state
    setFiles((p) => ({ ...p, [toolKey]: file }));

    // 3. Auto format conversion:
    // If the current format selected is "auto", change it to the uploaded file type automatically!
    if (fmts[toolKey] === "auto") {
      // Map file extension to format
      let detectedFmt = "auto";
      const rawExt = file.name.split('.').pop().toLowerCase();
      if (rawExt === "sarif") {
        detectedFmt = "sarif";
      } else if (rawExt === "xml") {
        detectedFmt = "xml";
      } else if (rawExt === "json") {
        detectedFmt = "json";
      } else if (rawExt === "jsonl") {
        detectedFmt = "jsonl";
      } else if (rawExt === "txt") {
        if (toolKey === "nmap") detectedFmt = "normal";
      } else if (rawExt === "gnmap") {
        if (toolKey === "nmap") detectedFmt = "grepable";
      } else if (rawExt === "md") {
        detectedFmt = "markdown";
      }

      if (tool.formats.includes(detectedFmt)) {
        setFmts((p) => ({ ...p, [toolKey]: detectedFmt }));
      }
    }
  };

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
        navigate("/dashboard");
      },
      (err) => {
        setError(String(err));
        setIsProcessing(false);
        setProgress(null);
      },
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Error Toaster */}
      {toastError && (
        <div className="fixed top-5 right-5 z-[2000] max-w-sm rounded-md border border-[var(--border)] border-l-4 border-l-red-500 bg-[var(--surface-2)] p-4 text-[var(--foreground)] shadow-md transition-all duration-300 animate-slide-in flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm font-semibold">{toastError}</p>
          </div>
          <button onClick={() => setToastError(null)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] shrink-0 cursor-pointer">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      <PageHeader
        title="Upload Scan Results"
        subtitle="Supports OWASP ZAP, Nuclei, OpenVAS & Nmap — all formats, max 1 GB per file."
      />

      {/* Asset Criticality */}
      <Card className="!rounded-md">
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
                "px-4 py-2.5 rounded-md text-sm font-semibold border smooth-transition cursor-pointer",
                "hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-transparent",
                crit === o.value
                  ? "bg-[var(--primary-600)]/10 border-[var(--border)] text-[var(--primary-600)]"
                  : "bg-[var(--accent)] border-[var(--border)] text-[var(--muted-foreground)]"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Card>

      {/* File Upload Zones */}
      <div>
        <h2 className="text-[18px] font-bold text-[var(--foreground)] mb-4">
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
              onFile={(f) => handleFileChange(t.key, f)}
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
        className="w-full !rounded-md"
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Processing Scans...</span>
          </>
        ) : (
          <span>Analyze & Prioritize Findings</span>
        )}
      </Button>

      <p className="text-xs text-center text-[var(--muted-foreground)]">
        Your scans are processed securely. No data is stored after analysis.
      </p>
    </div>
  );
}
