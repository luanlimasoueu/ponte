import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb, getUser } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { requestMentorship, toggleEndorsement } from "@/lib/actions";
import { Badge, Card, Empty, Flash, SkillChips, TYPE_LABELS, btnCls } from "@/components/ui";

export const dynamic = "force-dynamic";

type ContributionRow = {
  id: number;
  title: string;
  url: string;
  type: string;
  description: string;
  created_at: string;
  endorsers: string | null;
  endorsedByMe: number;
};

export default async function PessoaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ msg?: string; error?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const profile = getUser(Number(id));
  if (!profile) notFound();
  const viewer = await getSessionUser();
  const db = getDb();
  const ret = `/pessoas/${profile.id}`;

  const isMentorSide = profile.role === "mentor" || profile.role === "company";

  const contributions = db
    .prepare(
      `SELECT c.*,
         (SELECT GROUP_CONCAT(u.name, ' & ') FROM endorsements e JOIN users u ON u.id = e.mentor_id WHERE e.contribution_id = c.id) AS endorsers,
         EXISTS(SELECT 1 FROM endorsements e WHERE e.contribution_id = c.id AND e.mentor_id = ?) AS endorsedByMe
       FROM contributions c WHERE c.user_id = ? ORDER BY c.created_at DESC`
    )
    .all(viewer?.id ?? 0, profile.id) as unknown as ContributionRow[];

  const network = db
    .prepare(
      `SELECT u.id, u.name, u.headline FROM mentorships m
       JOIN users u ON u.id = m.mentee_id
       WHERE m.mentor_id = ? AND m.status = 'active' ORDER BY u.name`
    )
    .all(profile.id) as unknown as { id: number; name: string; headline: string }[];

  const opportunities = db
    .prepare("SELECT * FROM opportunities WHERE owner_id = ? ORDER BY created_at DESC")
    .all(profile.id) as unknown as {
    id: number;
    type: string;
    title: string;
    description: string;
  }[];

  let myLink: { status: string } | undefined;
  let canEndorse = false;
  if (viewer) {
    if (viewer.role === "mentee" && isMentorSide) {
      myLink = db
        .prepare("SELECT status FROM mentorships WHERE mentor_id = ? AND mentee_id = ?")
        .get(profile.id, viewer.id) as { status: string } | undefined;
    }
    if ((viewer.role === "mentor" || viewer.role === "company") && profile.role === "mentee") {
      canEndorse = !!db
        .prepare(
          "SELECT 1 FROM mentorships WHERE mentor_id = ? AND mentee_id = ? AND status = 'active'"
        )
        .get(viewer.id, profile.id);
    }
  }

  return (
    <div className="space-y-6">
      <Flash params={sp} />
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <Badge kind={profile.role} />
            </div>
            <p className="mt-1 text-muted">{profile.headline}</p>
          </div>
          {viewer?.role === "mentee" &&
            isMentorSide &&
            (myLink?.status === "active" ? (
              <Badge kind="active" label="Na sua rede" />
            ) : myLink?.status === "pending" ? (
              <Badge kind="pending" label="Solicitacao enviada" />
            ) : (
              <form action={requestMentorship}>
                <input type="hidden" name="mentor_id" value={profile.id} />
                <input type="hidden" name="return" value={ret} />
                <button className={btnCls}>Solicitar mentoria</button>
              </form>
            ))}
        </div>
        {profile.bio && <p className="mt-4 text-sm text-fg/85">{profile.bio}</p>}
        <div className="mt-4">
          <SkillChips skills={profile.skills} />
        </div>
        {viewer && (
          <p className="mt-4 text-sm text-muted">
            Contato: <span className="font-mono">{profile.email}</span>
          </p>
        )}
      </Card>

      {profile.role === "mentee" && (
        <Card>
          <h2 className="font-semibold">Contribuicoes</h2>
          {contributions.length === 0 ? (
            <div className="mt-2">
              <Empty>Nenhuma contribuicao publicada ainda.</Empty>
            </div>
          ) : (
            <ul className="mt-4 space-y-4">
              {contributions.map((c) => (
                <li key={c.id} className="border-b border-line pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">
                      <Badge kind={c.type} label={TYPE_LABELS[c.type] ?? c.type} />{" "}
                      {c.url ? (
                        <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                          {c.title} ↗
                        </a>
                      ) : (
                        c.title
                      )}
                    </span>
                    {canEndorse && (
                      <form action={toggleEndorsement}>
                        <input type="hidden" name="contribution_id" value={c.id} />
                        <input type="hidden" name="return" value={ret} />
                        <button
                          className={`rounded-lg px-3 py-1 text-xs font-medium cursor-pointer ${
                            c.endorsedByMe
                              ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20"
                              : "border border-line text-muted hover:text-fg hover:bg-raised"
                          }`}
                        >
                          {c.endorsedByMe ? "✓ Recomendado" : "Recomendar"}
                        </button>
                      </form>
                    )}
                  </div>
                  {c.description && <p className="mt-1 text-sm text-muted">{c.description}</p>}
                  {c.endorsers && (
                    <p className="mt-1 text-xs font-medium text-emerald-400">
                      Recomendado por {c.endorsers}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {isMentorSide && (
        <>
          <Card>
            <h2 className="font-semibold">Rede de mentorados ({network.length})</h2>
            {network.length === 0 ? (
              <div className="mt-2">
                <Empty>Nenhum mentorado ativo ainda.</Empty>
              </div>
            ) : (
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {network.map((n) => (
                  <li key={n.id}>
                    <Link href={`/pessoas/${n.id}`} className="font-medium text-accent hover:underline">
                      {n.name}
                    </Link>
                    <p className="text-xs text-muted">{n.headline}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          {opportunities.length > 0 && (
            <Card>
              <h2 className="font-semibold">Oportunidades publicadas</h2>
              <ul className="mt-3 space-y-2">
                {opportunities.map((o) => (
                  <li key={o.id} className="text-sm">
                    <Badge kind={o.type} label={TYPE_LABELS[o.type]} />{" "}
                    <span className="font-medium">{o.title}</span>
                    {o.description && <p className="mt-0.5 text-muted">{o.description}</p>}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
