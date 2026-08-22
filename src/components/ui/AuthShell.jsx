import { ShieldAlert } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

/** Logo + wordmark header shared by every auth page (Login, Signup,
 * ForgotPassword, ResetPassword). */
export function AuthBrandHeader() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div
        className="flex items-center justify-center w-14 h-14 rounded-xl border"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <ShieldAlert className="w-7 h-7 logo-glow-blink" style={{ color: "var(--primary)" }} />
      </div>
      <div>
        <p className="font-black text-lg tracking-tight" style={{ color: "var(--foreground)" }}>VulneraX</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          Risk Prioritization
        </p>
      </div>
    </div>
  );
}

/** Shared MUI TextField/Button sx for the auth pages.
 * The button color is computed in JS from theme mode rather than via plain
 * var(--foreground)/var(--background) CSS-variable references in sx —
 * MUI's contained Button was found to override those specifically
 * (verified: identical var() references resolve correctly on plain
 * elements, only the Button ends up inverted), so the exact hex is
 * resolved here to sidestep whatever MUI-internal precedence was winning. */
export function useAuthStyles() {
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const btnBg = isDark ? "#fafafa" : "#09090b";
  const btnFg = isDark ? "#09090b" : "#f4f4f5";

  const inputSx = {
    input: { color: "var(--foreground)" },
    ".MuiOutlinedInput-root": {
      bgcolor: "var(--surface-2)",
      borderRadius: "10px",
      ".MuiOutlinedInput-notchedOutline": { borderColor: "var(--border)" },
      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--muted-foreground)" },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--primary)", borderWidth: "1.5px" },
    },
    ".MuiInputLabel-root": { color: "var(--muted-foreground)" },
    ".MuiInputLabel-root.Mui-focused": { color: "var(--primary)" },
  };

  const buttonSx = {
    bgcolor: btnBg, color: btnFg,
    "&:hover": { bgcolor: btnBg, opacity: 0.85 },
    "&.Mui-disabled": { bgcolor: "var(--muted-foreground)", color: btnFg },
    textTransform: "none", fontWeight: 700, py: 1.1, borderRadius: "10px",
  };

  return { inputSx, buttonSx };
}
