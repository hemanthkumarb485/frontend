import { useState, useEffect } from "react";
import { Sparkles, Ticket, X } from "lucide-react";
import { Dialog, DialogContent, DialogActions, IconButton, CircularProgress } from "@mui/material";
import { enhanceTicketDescription } from "../api/client";

/**
 * Pre-submit ticket editor opened from "Create Ticket" / "Raise Ticket" buttons.
 * Lets the user review/edit the description and optionally enhance it with
 * Claude before the issue is actually created via onSubmit.
 */
export default function TicketComposerModal({ finding, open, onClose, onSubmit, submitting }) {
  const [description, setDescription] = useState("");
  const [enhancing, setEnhancing] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (finding) {
      setDescription(finding.description ? finding.description.replace(/<[^>]+>/g, " ").trim() : "");
      setErr(null);
    }
  }, [finding]);

  if (!finding) return null;

  const enhance = async () => {
    setEnhancing(true);
    setErr(null);
    try {
      const r = await enhanceTicketDescription(finding, description);
      setDescription(r.description);
    } catch (e) {
      setErr(e.response?.data?.detail || e.message);
    } finally {
      setEnhancing(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            backgroundColor: "var(--surface)",
            backgroundImage: "none",
            borderRadius: "14px",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          },
        },
      }}
    >
      <div className="flex items-start gap-4 border-b border-[var(--border)]/60 p-5">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold tracking-tight text-[var(--foreground)]">Raise Ticket</h2>
          <p className="text-[12px] text-[var(--muted-foreground)] mt-1 truncate">{finding.vulnerability_name}</p>
        </div>
        <IconButton size="small" onClick={onClose} sx={{ color: "var(--muted-foreground)" }}>
          <X className="size-4" />
        </IconButton>
      </div>

      <DialogContent sx={{ color: "var(--foreground)" }}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              Description
            </label>
            <button
              onClick={enhance}
              disabled={enhancing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-[var(--primary)]/40 text-[var(--primary)] hover:bg-[var(--primary)]/10 smooth-transition disabled:opacity-50 cursor-pointer"
            >
              {enhancing ? <CircularProgress size={12} color="inherit" /> : <Sparkles className="size-3.5" />}
              {enhancing ? "Enhancing…" : "Enhance with AI"}
            </button>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            className="w-full rounded-lg border p-3 text-[12.5px] leading-relaxed bg-[var(--surface-2)] border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]/50"
            placeholder="Describe the vulnerability for the developer who'll fix it…"
          />
          {err && <p className="text-[11px] text-[var(--sev-critical)]">{err}</p>}
          <p className="text-[11px] text-[var(--muted-foreground)]">
            The rest of the issue (severity, risk score breakdown, threat intel, asset details) is generated automatically.
          </p>
        </div>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: "1px solid var(--border)" }}>
        <button
          onClick={() => onSubmit(description)}
          disabled={submitting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--primary-600)] hover:bg-[var(--primary-700)] text-[var(--primary-foreground)] smooth-transition cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Ticket className="size-3.5" />
          {submitting ? "Creating…" : "Create Ticket"}
        </button>
      </DialogActions>
    </Dialog>
  );
}
