import Link from "next/link";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { requestMentorship } from "@/lib/actions";
import { Badge, Card, Empty, Flash, SkillChips, inputCls, btnCls } from "@/components/ui";

export const dynamic = "force-dynamic";

type MentorRow = {
  id: number;
  name: string;
  role: string;
  headline: string;
  bio: string;
  skills: string;
  mentees: number;
};

export default async function MentoresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; msg?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const user = await getSessionUser();
  const q = (sp.q ?? "").trim();
  const like = `%${q}%`;
  const db = getDb();

  const mentors = db
    .prepare(
      `SELECT u.*,
         (SELECT COUNT(*) FROM mentorships m WHERE m.mentor_id = u.id AND m.status = 'active') AS mentees
       FROM users u
       WHERE u.role IN ('mentor','company')
         AND (u.name LIKE ? OR u.skills LIKE ? OR u.headline LIKE ? OR u.bio LIKE ?)
       ORDER BY (u.role = 'mentor') DESC, mentees DESC, u.name`
    )
    .all(like, like, like, like) as unknown as MentorRow[];

  const myStatus = new Map<number, string>();
  if (user?.role === "mentee") {
    const rows = db
      .prepare("SELECT mentor_id, status FROM mentorships WHERE mentee_id = ?")
      .all(user.id) as unknown as { mentor_id: number; status: string }[];
    for (const r of rows) myStatus.set(r.mentor_id, r.status);
  }

  const ret = `/mentores${q ? `?q=${encodeURIComponent(q)}` : ""}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mentores e empresas</h1>
        <p className="mt-1 text-muted">
          Especialistas de diversas areas e empresas que mentoram talentos. Voce pode ter mais de um mentor.
        </p>
      </div>
      <Flash params={sp} />

      <form method="GET" action="/mentores" className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome, especialidade, area..."
          className={`${inputCls} max-w-md`}
        />
        <button className={btnCls}>Buscar</button>
      </form>

      {mentors.length === 0 ? (
        <Empty>Nenhum mentor encontrado para esta busca.</Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {mentors.map((m) => {
            const status = myStatus.get(m.id);
            return (
              <Card key={m.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link href={`/pessoas/${m.id}`} className="font-semibold text-accent hover:underline">
                      {m.name}
                    </Link>
                    <p className="text-sm text-muted">{m.headline}</p>
                  </div>
                  <Badge kind={m.role} />
                </div>
                <div className="mt-3">
                  <SkillChips skills={m.skills} />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted">
                    {m.mentees} {m.mentees === 1 ? "pessoa na rede" : "pessoas na rede"}
                  </span>
                  {user?.role === "mentee" &&
                    (status === "active" ? (
                      <Badge kind="active" label="Na sua rede" />
                    ) : status === "pending" ? (
                      <Badge kind="pending" label="Solicitacao enviada" />
                    ) : (
                      <form action={requestMentorship}>
                        <input type="hidden" name="mentor_id" value={m.id} />
                        <input type="hidden" name="return" value={ret} />
                        <button className={btnCls}>Solicitar mentoria</button>
                      </form>
                    ))}
                  {!user && (
                    <Link href="/login" className="text-sm text-accent hover:underline">
                      Entre para solicitar
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
