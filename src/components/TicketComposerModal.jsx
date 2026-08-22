import { useState, useEffect } from "react";
import { Sparkles, Ticket, X, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogActions, IconButton, CircularProgress } from "@mui/material";
import { getRemediationSuggestion, getAiOverview, getGithubRepos } from "../api/client";
import { MarkdownLite } from "./ui/MarkdownLite";
import { stripHtml } from "../utils/helpers";
import { useScan } from "../context/ScanContext";

/**
 * Pre-submit ticket editor opened from "Create Ticket" / "Raise Ticket" buttons.
 * Lets the user review/edit the description and remediation, and pick which
 * connected repo the issue goes to, before it's actually created via
 * onSubmit(description, remediation, repoFullName).
 *
 * The repo picker lives here (fetched fresh each time the modal opens)
 * rather than requiring a repo to already be chosen on the Tickets page —
 * that page's selection is still used as the default, but every ticket can
 * go to a different repo without leaving the finding you're looking at.
 *
 * Description defaults to the finding's AI Overview (the same analysis shown
 * on the finding detail page), not the scanner's raw one-liner — pass
 * `initialOverview` when the caller already fetched it (finding detail page)
 * to skip a redundant Groq call; otherwise this fetches it itself.
 *
 * "Enhance with AI" targets Remediation, not Description — the Overview is
 * already the AI-analyzed version of the description, so re-running AI on
 * the description here would just duplicate it. The ticket's remediation
 * guidance is what's otherwise just the scanner's thin one-liner, so
 * that's what benefits from the same AI remediation call used elsewhere.
 */
export default function TicketComposerModal({ finding, open, onClose, onSubmit, submitting, initialOverview }) {
  const { githubToken, selectedRepo, saveSelectedRepo } = useScan();
  const [description, setDescription] = useState("");
  const [remediation, setRemediation] = useState("");
  const [remediationEditing, setRemediationEditing] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [repos, setRepos] = useState([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [repoFullName, setRepoFullName] = useState(selectedRepo || "");
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!open || !githubToken) return;
    setReposLoading(true);
    getGithubRepos(githubToken)
      .then((d) => {
        const list = d.repositories || [];
        setRepos(list);
        setRepoFullName((prev) => {
          if (prev && list.some((r) => r.full_name === prev)) return prev;
          if (selectedRepo && list.some((r) => r.full_name === selectedRepo)) return selectedRepo;
          return list[0]?.full_name || "";
        });
      })
      .catch((e) => setErr(e.response?.data?.detail || e.message))
      .finally(() => setReposLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, githubToken]);

  const chooseRepo = (full_name) => {
    setRepoFullName(full_name);
    saveSelectedRepo(full_name);
  };

  useEffect(() => {
    if (!finding) return;
    setRemediation(finding.solution ? stripHtml(finding.solution) : "");
    setRemediationEditing(false);
    setErr(null);

    if (initialOverview) {
      setDescription(initialOverview);
      setOverviewLoading(false);
      return;
    }
    // No pre-fetched Overview (e.g. opened from the Tickets page rather
    // than the finding detail page) — fetch the same AI overview so the
    // ticket still gets the specific analysis instead of the scanner's
    // generic raw text. Falls back to the raw description if it fails.
    setDescription(finding.description ? stripHtml(finding.description) : "");
    setOverviewLoading(true);
    getAiOverview(finding)
      .then((r) => setDescription(r.overview))
      .catch(() => {})
      .finally(() => setOverviewLoading(false));
  }, [finding, initialOverview]);

  if (!finding) return null;

  const enhance = async () => {
    setEnhancing(true);
    setErr(null);
    try {
      const r = await getRemediationSuggestion(finding);
      setRemediation(r.suggestion);
      setRemediationEditing(false); // show the freshly-enhanced text rendered, not raw markdown
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
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              Repository
            </label>
            {reposLoading ? (
              <div className="flex items-center gap-2 text-[12px] text-[var(--muted-foreground)] p-2.5">
                <CircularProgress size={12} color="inherit" /> Loading repositories…
              </div>
            ) : repos.length === 0 ? (
              <p className="text-[12px] text-[var(--sev-critical)]">No repositories found — check your GitHub connection on the Tickets page.</p>
            ) : (
              <select
                value={repoFullName}
                onChange={(e) => chooseRepo(e.target.value)}
                className="w-full rounded-lg border p-2.5 text-[12.5px] bg-[var(--surface-2)] border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]/50"
              >
                {repos.map((r) => (
                  <option key={r.repo_id} value={r.full_name}>
                    {r.full_name}{r.is_private ? " (private)" : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                Description
              </label>
              {overviewLoading && <CircularProgress size={11} color="inherit" />}
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border p-3 text-[12.5px] leading-relaxed bg-[var(--surface-2)] border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]/50"
              placeholder="Describe the vulnerability for the developer who'll fix it…"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                Remediation
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setRemediationEditing((v) => !v)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-[var(--muted-foreground)] hover:bg-[var(--accent)] smooth-transition cursor-pointer"
                >
                  <Pencil className="size-3" /> {remediationEditing ? "Preview" : "Edit"}
                </button>
                <button
                  onClick={enhance}
                  disabled={enhancing}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-[var(--primary)]/40 text-[var(--primary)] hover:bg-[var(--primary)]/10 smooth-transition disabled:opacity-50 cursor-pointer"
                >
                  {enhancing ? <CircularProgress size={12} color="inherit" /> : <Sparkles className="size-3.5" />}
                  {enhancing ? "Enhancing…" : "Enhance with AI"}
                </button>
              </div>
            </div>
            {remediationEditing ? (
              <textarea
                value={remediation}
                onChange={(e) => setRemediation(e.target.value)}
                rows={6}
                autoFocus
                className="w-full rounded-lg border p-3 text-[12.5px] leading-relaxed bg-[var(--surface-2)] border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]/50"
                placeholder="Remediation steps for the developer who'll fix it…"
              />
            ) : (
              <div
                onClick={() => setRemediationEditing(true)}
                className="w-full max-h-48 overflow-y-auto rounded-lg border p-3 text-[12.5px] leading-relaxed whitespace-pre-line bg-[var(--surface-2)] border-[var(--border)] text-[var(--foreground)] cursor-text"
                title="Click to edit"
              >
                {remediation ? <MarkdownLite text={remediation} /> : (
                  <span className="text-[var(--muted-foreground)]">Remediation steps for the developer who'll fix it…</span>
                )}
              </div>
            )}
          </div>

          {err && <p className="text-[11px] text-[var(--sev-critical)]">{err}</p>}
          <p className="text-[11px] text-[var(--muted-foreground)]">
            The rest of the issue (severity, risk score breakdown, threat intel, asset details) is generated automatically.
          </p>
        </div>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: "1px solid var(--border)" }}>
        <button
          onClick={() => onSubmit(description, remediation, repoFullName)}
          disabled={submitting || !repoFullName}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--primary-600)] hover:bg-[var(--primary-700)] text-[var(--primary-foreground)] smooth-transition cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Ticket className="size-3.5" />
          {submitting ? "Creating…" : "Create Ticket"}
        </button>
      </DialogActions>
    </Dialog>
  );
}
