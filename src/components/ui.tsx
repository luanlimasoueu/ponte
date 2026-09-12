import type { ReactNode } from "react";

const BADGE_COLORS: Record<string, string> = {
  mentor: "bg-violet-100 text-violet-800",
  mentee: "bg-emerald-100 text-emerald-800",
  company: "bg-amber-100 text-amber-800",
  open_source: "bg-sky-100 text-sky-800",
  evento: "bg-rose-100 text-rose-800",
  vaga: "bg-amber-100 text-amber-800",
  projeto: "bg-stone-100 text-stone-700",
  pending: "bg-stone-100 text-stone-600",
  active: "bg-emerald-100 text-emerald-800",
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
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE_COLORS[kind] ?? "bg-stone-100 text-stone-700"}`}
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
        <span key={s} className="rounded-md bg-stone-100 px-2 py-0.5 text-xs text-stone-700">
          {s}
        </span>
      ))}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-stone-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Flash({ params }: { params: { msg?: string; error?: string } }) {
  if (!params.msg && !params.error) return null;
  return (
    <div
      className={`mb-4 rounded-lg px-4 py-3 text-sm ${
        params.error
          ? "bg-red-50 text-red-800 border border-red-200"
          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
      }`}
    >
      {params.error ?? params.msg}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-stone-500 italic">{children}</p>;
}

export const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200";

export const btnCls =
  "inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors cursor-pointer";

export const btnSecondaryCls =
  "inline-flex items-center justify-center rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer";
