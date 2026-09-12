import Link from "next/link";
import { redirect } from "next/navigation";
import { getDb, type User } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import {
  updateProfile,
  respondMentorship,
  removeMentorship,
  addContribution,
  deleteContribution,
  addOpportunity,
  deleteOpportunity,
} from "@/lib/actions";
import {
  Badge,
  Card,
  Empty,
  Flash,
  SkillChips,
  TYPE_LABELS,
  inputCls,
  btnCls,
  btnSecondaryCls,
} from "@/components/ui";

export const dynamic = "force-dynamic";

type SP = { msg?: string; error?: string };

type LinkRow = {
  mentorship_id: number;
  id: number;
  name: string;
  headline: string;
  role: string;
  skills: string;
};

type ContributionRow = {
  id: number;
  title: string;
  url: string;
  type: string;
  description: string;
  endorsements: number;
  endorsers: string | null;
};

type OppRow = {
  id: number;
  type: string;
  title: string;
  description: string;
  created_at: string;
};

function ProfileEditor({ user }: { user: User }) {
  return (
    <Card>
      <h2 className="font-semibold">Editar perfil</h2>
      <form action={updateProfile} className="mt-3 space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Titulo / resumo</label>
          <input name="headline" defaultValue={user.headline} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Bio</label>
          <textarea name="bio" defaultValue={user.bio} rows={3} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Especialidades (virgula)</label>
          <input name="skills" defaultValue={user.skills} className={inputCls} />
        </div>
        <button className={btnSecondaryCls}>Salvar perfil</button>
      </form>
    </Card>
  );
}

function OpportunityEditor({ myOpps }: { myOpps: OppRow[] }) {
  return (
    <Card>
      <h2 className="font-semibold">Publicar oportunidade</h2>
      <p className="mt-1 text-xs text-stone-500">
        Projetos open source, eventos ou vagas — visiveis para toda a comunidade.
      </p>
      <form action={addOpportunity} className="mt-3 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="title" required placeholder="Titulo" className={inputCls} />
          <select name="type" required className={inputCls}>
            <option value="open_source">Open source</option>
            <option value="evento">Evento</option>
            <option value="vaga">Vaga</option>
          </select>
        </div>
        <textarea name="description" rows={2} placeholder="Descricao" className={inputCls} />
        <input name="skills" placeholder="Skills desejadas (virgula)" className={inputCls} />
        <button className={btnSecondaryCls}>Publicar</button>
      </form>
      {myOpps.length > 0 && (
        <ul className="mt-4 space-y-2">
          {myOpps.map((o) => (
            <li key={o.id} className="flex items-center justify-between gap-3 rounded-lg bg-stone-50 px-3 py-2 text-sm">
              <span>
                <Badge kind={o.type} label={TYPE_LABELS[o.type]} /> {o.title}
              </span>
              <form action={deleteOpportunity}>
                <input type="hidden" name="id" value={o.id} />
                <button className="text-xs text-red-600 hover:underline">remover</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function PendingRequests({ rows }: { rows: LinkRow[] }) {
  if (rows.length === 0) return null;
  return (
    <Card className="border-violet-300">
      <h2 className="font-semibold">Solicitacoes de mentoria</h2>
      <ul className="mt-3 space-y-3">
        {rows.map((r) => (
          <li key={r.mentorship_id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Link href={`/pessoas/${r.id}`} className="font-medium text-violet-700 hover:underline">
                {r.name}
              </Link>
              <p className="text-sm text-stone-500">{r.headline}</p>
              <SkillChips skills={r.skills} />
            </div>
            <form action={respondMentorship} className="flex gap-2">
              <input type="hidden" name="id" value={r.mentorship_id} />
              <button name="decision" value="accept" className={btnCls}>
                Aceitar
              </button>
              <button name="decision" value="decline" className={btnSecondaryCls}>
                Recusar
              </button>
            </form>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function NetworkList({ rows, title, empty }: { rows: LinkRow[]; title: string; empty: string }) {
  return (
    <Card>
      <h2 className="font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <div className="mt-2">
          <Empty>{empty}</Empty>
        </div>
      ) : (
        <ul className="mt-3 space-y-3">
          {rows.map((r) => (
            <li key={r.mentorship_id} className="flex items-center justify-between gap-3">
              <div>
                <Link href={`/pessoas/${r.id}`} className="font-medium text-violet-700 hover:underline">
                  {r.name}
                </Link>
                <p className="text-sm text-stone-500">{r.headline}</p>
              </div>
              <form action={removeMentorship}>
                <input type="hidden" name="id" value={r.mentorship_id} />
                <button className="text-xs text-stone-400 hover:text-red-600">desconectar</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const sp = await searchParams;
  const db = getDb();

  const links = db
    .prepare(
      `SELECT m.id AS mentorship_id, m.status, m.mentor_id, m.mentee_id,
              u.id, u.name, u.headline, u.role, u.skills
       FROM mentorships m
       JOIN users u ON u.id = CASE WHEN m.mentor_id = ? THEN m.mentee_id ELSE m.mentor_id END
       WHERE (m.mentor_id = ? OR m.mentee_id = ?)`
    )
    .all(user.id, user.id, user.id) as unknown as (LinkRow & { status: string })[];

  const myOpps = db
    .prepare("SELECT * FROM opportunities WHERE owner_id = ? ORDER BY created_at DESC")
    .all(user.id) as unknown as OppRow[];

  const isMentorSide = user.role === "mentor" || user.role === "company";
  const incoming = links.filter((l) => l.status === "pending" && isMentorSide);
  const sentPending = links.filter((l) => l.status === "pending" && !isMentorSide);
  const network = links.filter((l) => l.status === "active");

  const myContribs =
    user.role === "mentee"
      ? (db
          .prepare(
            `SELECT c.*,
               (SELECT COUNT(*) FROM endorsements e WHERE e.contribution_id = c.id) AS endorsements,
               (SELECT GROUP_CONCAT(u.name, ' & ') FROM endorsements e JOIN users u ON u.id = e.mentor_id WHERE e.contribution_id = c.id) AS endorsers
             FROM contributions c WHERE c.user_id = ? ORDER BY c.created_at DESC`
          )
          .all(user.id) as unknown as ContributionRow[])
      : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <Badge kind={user.role} />
      </div>
      <Flash params={sp} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {isMentorSide ? (
            <>
              <PendingRequests rows={incoming} />
              <NetworkList
                rows={network}
                title="Minha rede de mentorados"
                empty="Ninguem na sua rede ainda. Aceite solicitacoes de mentoria."
              />
              {user.role === "company" && (
                <Card className="bg-amber-50">
                  <h2 className="font-semibold">Encontrar talentos</h2>
                  <p className="mt-1 text-sm text-stone-600">
                    Busque mentorados por habilidade e veja contribuicoes reais recomendadas por mentores.
                  </p>
                  <Link href="/talentos" className={`${btnCls} mt-3`}>
                    Buscar talentos
                  </Link>
                </Card>
              )}
            </>
          ) : (
            <>
              <NetworkList
                rows={network}
                title="Meus mentores"
                empty="Voce ainda nao tem mentores. Explore a comunidade e solicite mentoria."
              />
              {sentPending.length > 0 && (
                <Card>
                  <h2 className="font-semibold">Solicitacoes enviadas</h2>
                  <ul className="mt-3 space-y-2">
                    {sentPending.map((r) => (
                      <li key={r.mentorship_id} className="flex items-center justify-between text-sm">
                        <span>
                          {r.name} <Badge kind="pending" label="aguardando" />
                        </span>
                        <form action={removeMentorship}>
                          <input type="hidden" name="id" value={r.mentorship_id} />
                          <button className="text-xs text-stone-400 hover:text-red-600">cancelar</button>
                        </form>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
              <Card className="bg-violet-50">
                <h2 className="font-semibold">Encontrar mentores</h2>
                <p className="mt-1 text-sm text-stone-600">
                  Voce pode ter varios mentores, de areas diferentes.
                </p>
                <Link href="/mentores" className={`${btnCls} mt-3`}>
                  Explorar mentores
                </Link>
              </Card>
            </>
          )}
          <ProfileEditor user={user} />
        </div>

        <div className="space-y-6">
          {user.role === "mentee" ? (
            <Card>
              <h2 className="font-semibold">Minhas contribuicoes</h2>
              <p className="mt-1 text-xs text-stone-500">
                Projetos, PRs, palestras e eventos — visiveis no seu perfil publico para empresas.
              </p>
              <form action={addContribution} className="mt-3 space-y-3">
                <input name="title" required placeholder="Titulo da contribuicao" className={inputCls} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input name="url" type="url" placeholder="Link (opcional)" className={inputCls} />
                  <select name="type" className={inputCls}>
                    <option value="projeto">Projeto</option>
                    <option value="open_source">Open source</option>
                    <option value="evento">Evento / palestra</option>
                  </select>
                </div>
                <textarea name="description" rows={2} placeholder="O que voce fez?" className={inputCls} />
                <button className={btnSecondaryCls}>Publicar contribuicao</button>
              </form>
              {myContribs.length > 0 && (
                <ul className="mt-4 space-y-3">
                  {myContribs.map((c) => (
                    <li key={c.id} className="rounded-lg bg-stone-50 px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">
                          <Badge kind={c.type} label={TYPE_LABELS[c.type] ?? c.type} /> {c.title}
                        </span>
                        <form action={deleteContribution}>
                          <input type="hidden" name="id" value={c.id} />
                          <button className="text-xs text-stone-400 hover:text-red-600">remover</button>
                        </form>
                      </div>
                      {c.endorsements > 0 && (
                        <p className="mt-1 text-xs text-emerald-700">
                          Recomendado por {c.endorsers}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ) : (
            <OpportunityEditor myOpps={myOpps} />
          )}
          <Card>
            <h2 className="font-semibold">Seu perfil publico</h2>
            <p className="mt-1 text-sm text-stone-500">
              Qualquer pessoa pode ver seu perfil, rede e contribuicoes.
            </p>
            <Link href={`/pessoas/${user.id}`} className="mt-2 inline-block text-sm text-violet-700 hover:underline">
              Ver meu perfil publico →
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
