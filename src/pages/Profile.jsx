import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCircleIcon, ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { Card, CardHeader } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { fmtDate } from "../utils/helpers";

function CopyableField({ label, value }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-1.5 text-[var(--muted-foreground)]">
        {label}
      </p>
      <div
        className="flex items-center gap-2 rounded-lg border px-3 py-2.5"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
      >
        <span className="mono text-[13px] flex-1 min-w-0 truncate text-[var(--foreground)]">{value}</span>
        <button
          onClick={copy}
          className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] smooth-transition cursor-pointer shrink-0"
          title="Copy"
        >
          {copied ? <CheckIcon className="w-4 h-4 text-emerald-500" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="Profile" subtitle="Your account details." />

      <Card>
        <CardHeader title="Account" subtitle="Managed by Supabase Auth" />
        <div className="flex items-center gap-4 mt-4 mb-6">
          <div
            className="grid size-14 shrink-0 place-items-center rounded-full border"
            style={{ background: "var(--accent)", borderColor: "var(--border)" }}
          >
            <UserCircleIcon className="w-8 h-8" style={{ color: "var(--muted-foreground)" }} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[15px] text-[var(--foreground)] truncate">{user.email}</p>
            {user.created_at && (
              <p className="text-[12.5px] text-[var(--muted-foreground)] mt-0.5">
                Member since {fmtDate(user.created_at)}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <CopyableField label="User ID" value={user.id} />
          <CopyableField label="Email" value={user.email} />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="secondary" onClick={() => signOut().then(() => navigate("/login"))}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
