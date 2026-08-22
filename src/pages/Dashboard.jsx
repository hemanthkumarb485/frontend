import { useScan } from "../context/ScanContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { StatCard, Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  CalendarIcon,
  ServerIcon,
} from "@heroicons/react/24/outline";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { BarChart as MuiBarChart } from "@mui/x-charts/BarChart";

// Helper components for visualizations

const toolStyles = {
  zap: { name: "OWASP ZAP", color: "text-[#00a8ff] bg-[#00a8ff]/10 border-[#00a8ff]/20", dot: "bg-[#00a8ff]" },
  nuclei: { name: "Nuclei", color: "text-[#9333ea] bg-[#9333ea]/10 border-[#9333ea]/20", dot: "bg-[#9333ea]" },
  openvas: { name: "OpenVAS", color: "text-[#0891b2] bg-[#0891b2]/10 border-[#0891b2]/20", dot: "bg-[#0891b2]" },
  nmap: { name: "Nmap", color: "text-[#059669] bg-[#059669]/10 border-[#059669]/20", dot: "bg-[#059669]" },
};

function ScannerBadge({ tool }) {
  const normalized = (tool || "").toLowerCase().trim();
  const config = toolStyles[normalized] || {
    name: tool,
    color: "text-slate-400 bg-slate-400/10 border-slate-400/20",
    dot: "bg-slate-400",
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      <span>{config.name}</span>
    </div>
  );
}

function MetricProgressBar({ label, displayValue, percentage, barColor = "bg-[#00a8ff]", isDark }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[13px] font-medium">
        <span className={isDark ? "text-slate-400" : "text-[var(--muted-foreground)]"}>{label}</span>
        <span className={`${isDark ? "text-white" : "text-[var(--foreground)]"} font-bold font-mono`}>{displayValue}</span>
      </div>
      <div className="w-full h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-500 rounded-full`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </div>
  );
}

function CompositeRiskCard({ score, riskLabel, color, cvss, epss, kev, criticality, exposure, isDark }) {
  const size = 210;
  const radius = 84;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div
      className="rounded-xl p-6 flex flex-col items-center h-full glow-box smooth-transition"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <div className="w-full text-left mb-6">
        <h3 className={`font-bold text-[16px] ${isDark ? "text-white" : "text-[var(--foreground)]"}`}>Composite Risk Score</h3>
        <p className={`text-[12px] mt-1 ${isDark ? "text-slate-400" : "text-[var(--muted-foreground)]"}`}>CVSS + EPSS + KEV + exploit + asset context</p>
      </div>

      {/* SVG Gauge */}
      <div className="relative flex items-center justify-center mb-8" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.06)"}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-[54px] font-black tracking-tight leading-none ${isDark ? "text-white" : "text-[var(--foreground)]"}`}>{score}</span>
          <span className={`text-[13px] font-mono mt-1 ${isDark ? "text-slate-400" : "text-[var(--muted-foreground)]"}`}>/ 100</span>
          <span className="text-[12px] font-bold uppercase tracking-[0.15em] mt-3.5" style={{ color }}>
            {riskLabel}
          </span>
        </div>
      </div>

      {/* Details List */}
      <div className="w-full space-y-5">
        <MetricProgressBar
          label="CVSS Score"
          displayValue={cvss.toFixed(1)}
          percentage={cvss * 10}
          barColor={cvss >= 9.0 ? "bg-gradient-to-r from-purple-600 to-fuchsia-500" : cvss >= 7.0 ? "bg-gradient-to-r from-red-600 to-rose-500" : cvss >= 4.0 ? "bg-gradient-to-r from-amber-500 to-orange-400" : "bg-gradient-to-r from-emerald-500 to-teal-400"}
          isDark={isDark}
        />
        <MetricProgressBar
          label="EPSS Probability"
          displayValue={`${epss}%`}
          percentage={epss}
          barColor={epss >= 50 ? "bg-gradient-to-r from-red-600 to-rose-500" : epss >= 10 ? "bg-gradient-to-r from-amber-500 to-orange-400" : "bg-gradient-to-r from-emerald-500 to-teal-400"}
          isDark={isDark}
        />
        <MetricProgressBar
          label="CISA KEV Matches"
          displayValue={kev}
          percentage={Math.min(100, (kev / 10) * 100)} // scale to 10 max
          barColor={kev > 0 ? "bg-gradient-to-r from-red-600 to-rose-500" : "bg-gradient-to-r from-emerald-500 to-teal-400"}
          isDark={isDark}
        />
        <MetricProgressBar
          label="Asset Criticality"
          displayValue={criticality.label}
          percentage={criticality.percent}
          barColor={criticality.label === "HIGH" || criticality.label === "CRITICAL" ? "bg-gradient-to-r from-red-600 to-rose-500" : criticality.label === "MEDIUM" ? "bg-gradient-to-r from-amber-500 to-orange-400" : "bg-gradient-to-r from-emerald-500 to-teal-400"}
          isDark={isDark}
        />
        <MetricProgressBar
          label="Internet Exposure"
          displayValue={exposure}
          percentage={exposure}
          barColor={exposure >= 70 ? "bg-gradient-to-r from-red-600 to-rose-500" : exposure >= 30 ? "bg-gradient-to-r from-amber-500 to-orange-400" : "bg-gradient-to-r from-emerald-500 to-teal-400"}
          isDark={isDark}
        />
      </div>
    </div>
  );
}

function SeverityPieCard({ findings, isDark }) {
  const navigate = useNavigate();

  const counts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };

  findings.forEach((f) => {
    const sev = (f.severity || "").toLowerCase();
    if (sev === "critical") counts.critical++;
    else if (sev === "high") counts.high++;
    else if (sev === "medium") counts.medium++;
    else if (sev === "low") counts.low++;
    else counts.info++;
  });

  const total = findings.length;

  const data = [
    { name: "Critical", value: counts.critical, color: "var(--sev-critical)", rawKey: "critical" },
    { name: "High", value: counts.high, color: "var(--sev-high)", rawKey: "high" },
    { name: "Medium", value: counts.medium, color: "var(--sev-medium)", rawKey: "medium" },
    { name: "Low", value: counts.low, color: "var(--sev-low)", rawKey: "low" },
    { name: "Informational", value: counts.info, color: "var(--sev-info)", rawKey: "info" },
  ];

  const chartData = data.filter(d => d.value > 0);
  const fmtNum = (num) => new Intl.NumberFormat().format(num);

  return (
    <Card className="h-full flex flex-col">
      <div>
        <h3 className="font-bold text-base text-[var(--foreground)]">Risk Distribution</h3>
        <p className="text-[13px] mt-0.5 text-[var(--muted-foreground)]">
          Unique findings by severity — click a slice to filter
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 mt-2">
        {/* Donut Chart */}
        <div className="relative w-full h-[250px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData.length > 0 ? chartData : [{ name: "No Vulnerabilities", value: 1, color: "var(--border)" }]}
                cx="50%"
                cy="50%"
                innerRadius={78}
                outerRadius={105}
                paddingAngle={chartData.length > 1 ? 3 : 0}
                stroke="none"
                dataKey="value"
                onClick={(entry) => {
                  if (entry.rawKey) navigate(`/findings?severity=${entry.rawKey}`);
                }}
                className="cursor-pointer"
              >
                {chartData.length > 0 ? (
                  chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))
                ) : (
                  <Cell fill="var(--border)" />
                )}
              </Pie>
              <RechartsTooltip
                contentStyle={{
                  background: isDark ? "#171b26" : "#ffffff",
                  border: `1px solid ${isDark ? "#252a36" : "#e3e7ee"}`,
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                itemStyle={{ color: isDark ? "#e8ecf5" : "#1c2434" }}
                labelStyle={{ color: isDark ? "#ffffff" : "#1c2434", fontWeight: "bold" }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Centered Total Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-3.5xl font-black text-[var(--foreground)] tracking-tight">{fmtNum(total)}</span>
            <span className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase tracking-wider mt-0.5">
              Unique Findings
            </span>
          </div>
        </div>

        {/* Legend / Metrics List */}
        <div className="w-full max-w-sm space-y-1 mt-2">
          {data.map((item) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";
            return (
              <div
                key={item.name}
                onClick={() => navigate(`/findings?severity=${item.rawKey}`)}
                className="flex items-center justify-between p-1.5 rounded-lg smooth-transition hover:bg-[var(--accent)]/50 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: item.color }}
                  />
                  <span className="text-xs font-semibold text-[var(--foreground)]">{item.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-[var(--foreground)] font-mono">
                    {fmtNum(item.value)}
                  </span>
                  <span className="text-[10px] font-semibold text-[var(--muted-foreground)] w-9 text-right font-mono">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function ToolBarCard({ data, isDark }) {
  const colors = {
    ZAP: "#2563eb",
    Nuclei: "#9333ea",
    OpenVAS: "#0891b2",
    Nmap: "#059669",
  };

  // Adjust gap ratio dynamically based on data length to prevent overly thick bars
  const categoryGapRatio = data.length <= 1 ? 0.8 : data.length === 2 ? 0.65 : 0.45;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Findings by Tool" subtitle="Deduplicated findings per scanner tool" />
      <div className="flex-1 min-h-[200px] flex items-center justify-center p-4">
        <MuiBarChart
          xAxis={[{
            scaleType: 'band',
            data: data.map(d => d.name),
            categoryGapRatio,
            disableLine: true,
            disableTicks: true,
            tickLabelStyle: {
              fill: isDark ? '#94a3b8' : '#64748b',
              fontSize: 11,
            },
            colorMap: {
              type: 'ordinal',
              colors: data.map(d => colors[d.name] || 'var(--primary)'),
            }
          }]}
          yAxis={[{
            disableLine: true,
            disableTicks: true,
            tickLabelStyle: {
              fill: isDark ? '#94a3b8' : '#64748b',
              fontSize: 11,
            }
          }]}
          series={[{
            data: data.map(d => d.value),
            valueFormatter: (value) => `${value} findings`
          }]}
          height={200}
          margin={{ top: 15, right: 10, bottom: 25, left: 30 }}
          borderRadius={6}
          grid={{ horizontal: true }}
          slotProps={{
            legend: { hidden: true }
          }}
          sx={{
            width: '100%',
            '& .MuiChartsGrid-line': {
              stroke: isDark ? '#222a36' : '#e2e8f0',
              strokeDasharray: '4 4',
            },
          }}
        />
      </div>
    </Card>
  );
}

function NoiseReductionCard({ session }) {
  const before = session.total_raw_findings || 0;
  // total_after_fp_filter, not total_after_dedup: the false-positive pass
  // runs after dedup (see risk_engine pipeline), so it's the truly final
  // noise-reduced count — "what an analyst would actually have to open and
  // read" — rather than just the post-dedup count, which can still include
  // findings the FP rules go on to suppress.
  const after = session.total_after_fp_filter ?? session.total_after_dedup ?? 0;
  const reduction = before > 0 ? ((before - after) / before) * 100 : 0;
  const afterPct = before > 0 ? Math.max((after / before) * 100, after > 0 ? 2 : 0) : 0;

  if (before <= 0) return null;

  return (
    <Card className="w-full">
      <CardHeader
        title="Before / After Noise Reduction"
        subtitle="What analysts would triage without the pipeline vs with it"
      />
      <div className="space-y-4 mt-2">
        <div>
          <div className="flex items-center justify-between text-[13px] mb-1.5">
            <span className="text-[var(--muted-foreground)]">Before — raw scanner output</span>
            <span className="mono font-bold text-[var(--foreground)]">{before.toLocaleString()}</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--accent)" }}>
            <div className="h-full rounded-full bg-red-500" style={{ width: "100%" }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-[13px] mb-1.5">
            <span className="text-[var(--muted-foreground)]">After — deduplicated & filtered</span>
            <span className="mono font-bold text-[var(--foreground)]">{after.toLocaleString()}</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--accent)" }}>
            <div className="h-full rounded-full bg-emerald-500 smooth-transition" style={{ width: `${afterPct}%` }} />
          </div>
        </div>
      </div>
      <p className="text-[12.5px] text-[var(--muted-foreground)] mt-4">
        Analysts triage <span className="font-bold text-[var(--foreground)]">{reduction.toFixed(1)}%</span> fewer
        findings while the pipeline's dedup + false-positive passes filter out the noise.
      </p>
    </Card>
  );
}

function RiskScoreDensityCard({ findings, isDark }) {
  const ranges = [
    { name: "0-20 (Low)", value: 0 },
    { name: "21-40 (Med-Low)", value: 0 },
    { name: "41-60 (Med-High)", value: 0 },
    { name: "61-80 (High)", value: 0 },
    { name: "81-100 (Critical)", value: 0 },
  ];

  findings.forEach((f) => {
    const score = f.risk_score?.final_score || 0;
    if (score <= 20) ranges[0].value++;
    else if (score <= 40) ranges[1].value++;
    else if (score <= 60) ranges[2].value++;
    else if (score <= 80) ranges[3].value++;
    else ranges[4].value++;
  });

  return (
    <Card className="w-full">
      <CardHeader title="Risk Score Distribution" subtitle="Vulnerability count grouped by Composite Risk Score bands" />
      <div className="h-[220px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={ranges} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00a8ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00a8ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke={isDark ? "#222a36" : "#e2e8f0"} 
            />
            <XAxis
              dataKey="name"
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <RechartsTooltip
              contentStyle={{
                background: isDark ? "#171b26" : "#ffffff",
                border: `1px solid ${isDark ? "#252a36" : "#e3e7ee"}`,
                borderRadius: "8px",
                fontSize: "12px",
              }}
              itemStyle={{ color: isDark ? "#e8ecf5" : "#1c2434" }}
              labelStyle={{ color: isDark ? "#ffffff" : "#1c2434", fontWeight: "bold" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#00a8ff"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRisk)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { session } = useScan();
  const { mode } = useTheme();
  const navigate = useNavigate();
  const isDark = mode === "dark";

  if (!session) {
    return (
      <div className="flex items-center justify-center py-16">
        <Card className="w-full max-w-md text-center">
          <div
            className="grid size-14 mx-auto mb-4 place-items-center rounded-md border border-[var(--border)] bg-[var(--accent)] text-[var(--foreground)]"
          >
            <SparklesIcon className="w-7 h-7" />
          </div>
          <h2 className="text-[18px] font-bold text-[var(--foreground)] mb-2">
            No scan data yet
          </h2>
          <p className="text-[13px] text-[var(--muted-foreground)] mb-6">
            Upload security scanner results to see your vulnerability risk
            dashboard and prioritization analysis.
          </p>
          <Button
            onClick={() => navigate("/upload")}
            variant="primary"
            size="lg"
            className="w-full"
          >
            <span>Upload Scan Results</span>
          </Button>
        </Card>
      </div>
    );
  }

  const findings = session.findings || [];

  // Severity Breakdown
  const findingsBySeverity = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };

  let p0Count = 0;
  let p1Count = 0;

  // Tool Breakdown
  const toolsCount = {
    zap: 0,
    nuclei: 0,
    openvas: 0,
    nmap: 0,
  };

  findings.forEach((f) => {
    const sev = (f.severity || "").toLowerCase();
    if (sev === "critical") findingsBySeverity.critical++;
    else if (sev === "high") findingsBySeverity.high++;
    else if (sev === "medium") findingsBySeverity.medium++;
    else if (sev === "low") findingsBySeverity.low++;
    else findingsBySeverity.info++;

    const tier = f.risk_score?.priority_tier || "UNSCORED";
    if (tier === "P0") p0Count++;
    else if (tier === "P1") p1Count++;

    const scanners = f.deduplication?.source_scanners && f.deduplication.source_scanners.length > 0
      ? f.deduplication.source_scanners
      : [f.source_tool];

    scanners.forEach((s) => {
      const tool = (s || "").toLowerCase();
      if (tool in toolsCount) {
        toolsCount[tool]++;
      }
    });
  });

  const remediated = session.remediated || 0;

  // Pie Chart Data Formatter
  const pieData = [
    { name: "Critical", value: findingsBySeverity.critical },
    { name: "High", value: findingsBySeverity.high },
    { name: "Medium", value: findingsBySeverity.medium },
    { name: "Low", value: findingsBySeverity.low },
    { name: "Informational", value: findingsBySeverity.info },
  ].filter((item) => item.value > 0);

  // Bar Chart Data Formatter
  const barData = [
    { name: "ZAP", value: toolsCount.zap },
    { name: "Nuclei", value: toolsCount.nuclei },
    { name: "OpenVAS", value: toolsCount.openvas },
    { name: "Nmap", value: toolsCount.nmap },
  ].filter((item) => item.value > 0);

  // Composite Risk Score details calculations
  const scoredFindings = findings.filter(
    (f) => f.risk_score?.final_score !== undefined && f.risk_score?.final_score !== null
  );
  const sortedScored = [...scoredFindings].sort(
    (a, b) => (b.risk_score.final_score || 0) - (a.risk_score.final_score || 0)
  );
  const topCount = Math.max(1, Math.min(10, sortedScored.length));
  const topFindings = sortedScored.slice(0, topCount);
  const compositeRiskScore = topFindings.length > 0
    ? Math.round(topFindings.reduce((sum, f) => sum + (f.risk_score.final_score || 0), 0) / topFindings.length)
    : 0;

  let riskLabel = "LOW RISK";
  let gaugeColor = "#10b981";
  if (compositeRiskScore >= 90) {
    riskLabel = "CRITICAL RISK";
    gaugeColor = "#d946ef";
  } else if (compositeRiskScore >= 70) {
    riskLabel = "HIGH RISK";
    gaugeColor = "#ef4444";
  } else if (compositeRiskScore >= 40) {
    riskLabel = "MEDIUM RISK";
    gaugeColor = "#f97316";
  }

  const cvssFindings = findings.filter(
    (f) => f.cvss?.base_score !== undefined && f.cvss?.base_score !== null
  );
  const avgCvss = cvssFindings.length > 0
    ? cvssFindings.reduce((sum, f) => sum + f.cvss.base_score, 0) / cvssFindings.length
    : 0.0;

  const epssFindings = findings.filter(
    (f) => f.threat_intel?.epss_score !== undefined && f.threat_intel?.epss_score !== null
  );
  const avgEpss = epssFindings.length > 0
    ? Math.round((epssFindings.reduce((sum, f) => sum + f.threat_intel.epss_score, 0) / epssFindings.length) * 100)
    : 0;

  const kevMatches = findings.filter((f) => f.threat_intel?.is_kev).length;

  const criticality = findings[0]?.asset?.criticality || "unknown";
  let criticalityLabel = "MEDIUM";
  let criticalityPercent = 50;
  if (criticality === "production") {
    criticalityLabel = "HIGH";
    criticalityPercent = 100;
  } else if (criticality === "staging") {
    criticalityLabel = "MEDIUM";
    criticalityPercent = 66;
  } else if (criticality === "development") {
    criticalityLabel = "LOW";
    criticalityPercent = 33;
  }

  const exposedCount = findings.filter((f) => f.asset?.port || f.asset?.url || f.asset?.protocol).length;
  const avgExposure = findings.length > 0
    ? Math.max(36, Math.min(95, Math.round((exposedCount / findings.length) * 100)))
    : 36;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Risk Dashboard"
        subtitle={
          <>
            Session:{" "}
            <span className="mono font-semibold">
              {session.session_id?.slice(0, 12)}…
            </span>
            {session.scan_date && (
              <span className="ml-4">
                Scanned:{" "}
                <span className="font-medium">
                  {new Date(session.scan_date).toLocaleDateString()}
                </span>
              </span>
            )}
          </>
        }
      />

      {/* Processing Errors Alert Banner */}
      {session.processing_errors && session.processing_errors.length > 0 && (
        <div className="space-y-3">
          {session.processing_errors.map((err, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-4 rounded-lg border text-sm"
              style={{
                color: "var(--sev-destructive)",
                background: "color-mix(in oklab, var(--destructive) 10%, transparent)",
                borderColor: "color-mix(in oklab, var(--destructive) 25%, transparent)",
              }}
            >
              <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
              <div>
                <span className="font-bold">Error parsing {err.file}:</span>{" "}
                <span className="mono text-xs">{err.error}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ExclamationTriangleIcon}
          label="Total Findings"
          value={session.total_after_dedup}
          sub="After deduplication"
          color="text-[var(--primary)]"
        />
        <StatCard
          icon={ShieldCheckIcon}
          label="Critical (P0)"
          value={p0Count}
          sub="Immediate action required"
          color="text-[var(--sev-critical)]"
        />
        <StatCard
          icon={ExclamationTriangleIcon}
          label="High Priority (P1)"
          value={p1Count}
          sub="Important vulnerabilities"
          color="text-[var(--sev-high)]"
        />
        <StatCard
          icon={ClipboardDocumentListIcon}
          label="Remediated"
          value={remediated}
          sub="Issues fixed"
          color="text-emerald-600"
        />
      </div>

      {/* Visual Analytics Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composite Risk Score widget */}
        <div className="lg:col-span-1">
          <CompositeRiskCard
            score={compositeRiskScore}
            riskLabel={riskLabel}
            color={gaugeColor}
            cvss={avgCvss}
            epss={avgEpss}
            kev={kevMatches}
            criticality={{ label: criticalityLabel, percent: criticalityPercent }}
            exposure={avgExposure}
            isDark={isDark}
          />
        </div>

        {/* Breakdown charts */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <SeverityPieCard findings={findings} isDark={isDark} />
          <ToolBarCard data={barData} isDark={isDark} />
        </div>
      </div>

      {/* Risk Score Distribution Area Chart */}
      <RiskScoreDensityCard findings={findings} isDark={isDark} />

      {/* Before/After Noise Reduction */}
      <NoiseReductionCard session={session} />

      {/* Session Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Scan Information" subtitle="Metadata of the processed ingestion run" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Meta Attributes */}
            <div className="space-y-4">
              {session.scan_date && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--accent)]/50 rounded-lg text-[var(--muted-foreground)] shrink-0">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Scan Date</p>
                    <p className="text-sm font-semibold text-[var(--foreground)] mt-0.5">
                      {new Date(session.scan_date).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--accent)]/50 rounded-lg text-[var(--muted-foreground)] shrink-0">
                  <ServerIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Asset Category</p>
                  <p className="text-sm font-semibold text-[var(--foreground)] mt-0.5 capitalize">
                    {session.asset_criticality || "Staging"} Environment
                  </p>
                </div>
              </div>
              
              {session.total_raw_findings > 0 && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--accent)]/50 rounded-lg text-[var(--muted-foreground)] shrink-0">
                    <ShieldCheckIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Ingested Pipeline</p>
                    <p className="text-sm font-semibold text-[var(--foreground)] mt-0.5">
                      {session.total_raw_findings} raw findings → <span className="text-emerald-500 font-bold">{session.total_after_dedup} canonical</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Detected Tools Badges */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
                Tools Detected
              </p>
              <div className="flex flex-wrap gap-2.5">
                {session.tools_detected && session.tools_detected.map((t, idx) => (
                  <ScannerBadge key={idx} tool={t} />
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Next Steps" />
          <div className="space-y-2">
            <Button
              onClick={() => navigate("/findings")}
              variant="ghost"
              size="md"
              className="w-full justify-start"
            >
              <span>Review All Findings</span>
            </Button>
            <Button
              onClick={() => navigate("/priority")}
              variant="ghost"
              size="md"
              className="w-full justify-start"
            >
              <span>View Risk Prioritization</span>
            </Button>
            <Button
              onClick={() => navigate("/reports")}
              variant="ghost"
              size="md"
              className="w-full justify-start"
            >
              <span>Generate Report</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
