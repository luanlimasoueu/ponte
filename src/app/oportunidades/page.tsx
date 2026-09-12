import Link from "next/link";
import { getDb } from "@/lib/db";
import { Badge, Card, Empty, SkillChips, TYPE_LABELS } from "@/components/ui";

export const dynamic = "force-dynamic";

type OppRow = {
  id: number;
  type: string;
  title: string;
  description: string;
  skills: string;
  created_at: string;
  owner_id: number;
  owner_name: string;
  owner_role: string;
};

const FILTERS = [
  { key: "", label: "Todas" },
  { key: "open_source", label: "Open source" },
  { key: "evento", label: "Eventos" },
  { key: "vaga", label: "Vagas" },
];

export default async function OportunidadesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const sp = await searchParams;
  const type = sp.type ?? "";

  const rows = getDb()
    .prepare(
      `SELECT o.*, u.name AS owner_name, u.role AS owner_role, u.id AS owner_id
       FROM opportunities o JOIN users u ON u.id = o.owner_id
       WHERE (? = '' OR o.type = ?)
       ORDER BY o.created_at DESC`
    )
    .all(type, type) as unknown as OppRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Oportunidades</h1>
        <p className="mt-1 text-muted">
          Projetos open source, eventos e vagas publicados por mentores e empresas da comunidade.
        </p>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key ? `/oportunidades?type=${f.key}` : "/oportunidades"}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              type === f.key
                ? "bg-accent text-ink"
                : "border border-line bg-transparent text-muted hover:text-fg hover:bg-raised"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <Empty>Nenhuma oportunidade publicada nesta categoria.</Empty>
      ) : (
        <div className="space-y-4">
          {rows.map((o) => (
            <Card key={o.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Badge kind={o.type} label={TYPE_LABELS[o.type]} />{" "}
                  <span className="font-semibold">{o.title}</span>
                </div>
                <span className="text-xs text-muted/60">
                  {new Date(o.created_at + "Z").toLocaleDateString("pt-BR")}
                </span>
              </div>
              {o.description && <p className="mt-2 text-sm text-muted">{o.description}</p>}
              {o.skills && (
                <div className="mt-3">
                  <SkillChips skills={o.skills} />
                </div>
              )}
              <p className="mt-3 text-xs text-muted">
                Publicado por{" "}
                <Link href={`/pessoas/${o.owner_id}`} className="text-accent hover:underline">
                  {o.owner_name}
                </Link>{" "}
                · <Badge kind={o.owner_role} />
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
