import Link from "next/link";
import { getDb } from "@/lib/db";
import { Card, Empty, SkillChips, inputCls, btnCls } from "@/components/ui";

export const dynamic = "force-dynamic";

type TalentRow = {
  id: number;
  name: string;
  headline: string;
  skills: string;
  contributions: number;
  endorsements: number;
  mentors: number;
};

export default async function TalentosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const like = `%${q}%`;

  const mentees = getDb()
    .prepare(
      `SELECT u.*,
         (SELECT COUNT(*) FROM contributions c WHERE c.user_id = u.id) AS contributions,
         (SELECT COUNT(*) FROM endorsements e JOIN contributions c ON c.id = e.contribution_id WHERE c.user_id = u.id) AS endorsements,
         (SELECT COUNT(*) FROM mentorships m WHERE m.mentee_id = u.id AND m.status = 'active') AS mentors
       FROM users u
       WHERE u.role = 'mentee'
         AND (u.name LIKE ? OR u.skills LIKE ? OR u.headline LIKE ? OR u.bio LIKE ?)
       ORDER BY endorsements DESC, contributions DESC, u.name`
    )
    .all(like, like, like, like) as unknown as TalentRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Talentos</h1>
        <p className="mt-1 text-muted">
          Pessoas em inicio de carreira ou transicao com contribuicoes reais — muitas recomendadas
          pelos proprios mentores.
        </p>
      </div>

      <form method="GET" action="/talentos" className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por habilidade, nome, area..."
          className={`${inputCls} max-w-md`}
        />
        <button className={btnCls}>Buscar</button>
      </form>

      {mentees.length === 0 ? (
        <Empty>Nenhum talento encontrado para esta busca.</Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {mentees.map((t) => (
            <Card key={t.id}>
              <Link href={`/pessoas/${t.id}`} className="font-semibold text-accent hover:underline">
                {t.name}
              </Link>
              <p className="text-sm text-muted">{t.headline}</p>
              <div className="mt-3">
                <SkillChips skills={t.skills} />
              </div>
              <div className="mt-4 flex gap-4 text-xs text-muted">
                <span>{t.contributions} contribuicoes</span>
                <span className={t.endorsements > 0 ? "font-medium text-emerald-400" : ""}>
                  {t.endorsements} recomendacoes
                </span>
                <span>{t.mentors} mentores</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
