import type { ReactNode } from "react";

const BADGE_COLORS: Record<string, string> = {
  mentor: "border-accent/30 bg-accent/10 text-accent",
  mentee: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  company: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  open_source: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  evento: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  vaga: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  projeto: "border-line bg-raised text-muted",
  pending: "border-line bg-raised text-muted",
  active: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
};

export const ROLE_LABELS: Record<string, string> = {
  mentor: "Mentor(a)",
  mentee: "Mentorado(a)",
  company: "Empresa",
};

export const TYPE_LABELS: Record<string, string> = {
  open_source: "Open source",
  evento: "Evento",
  vaga: "Vaga",
  projeto: "Projeto",
};

export function Badge({ kind, label }: { kind: string; label?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${BADGE_COLORS[kind] ?? "border-line bg-raised text-muted"}`}
    >
      {label ?? ROLE_LABELS[kind] ?? TYPE_LABELS[kind] ?? kind}
    </span>
  );
}

export function SkillChips({ skills }: { skills: string }) {
  const items = skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((s) => (
        <span
          key={s}
          className="rounded border border-line bg-raised px-2 py-0.5 text-xs text-muted"
        >
          {s}
        </span>
      ))}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-line bg-surface p-5 ${className}`}>
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
      {children}
    </p>
  );
}

export function Flash({ params }: { params: { msg?: string; error?: string } }) {
  if (!params.msg && !params.error) return null;
  return (
    <div
      className={`mb-4 rounded-md border px-4 py-3 text-sm ${
        params.error
          ? "border-red-400/30 bg-red-400/10 text-red-300"
          : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
      }`}
    >
      {params.error ?? params.msg}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted/70 italic">{children}</p>;
}

export const inputCls =
  "w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-fg placeholder:text-muted/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40";

export const btnCls =
  "inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-ink hover:bg-accent-strong transition-colors cursor-pointer";

export const btnSecondaryCls =
  "inline-flex items-center justify-center rounded-md border border-line bg-transparent px-4 py-2 text-sm font-medium text-fg hover:border-fg/40 hover:bg-raised transition-colors cursor-pointer";
