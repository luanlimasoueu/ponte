import Link from "next/link";
import { Card } from "@/components/ui";

export default function Home() {
  return (
    <div className="space-y-16 py-6">
      <section className="text-center">
        <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          A ponte entre quem ja trilhou o caminho e{" "}
          <span className="text-violet-700">quem esta comecando</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-stone-600">
          Comunidade aberta que conecta profissionais experientes a pessoas em
          inicio de carreira ou transicao — em qualquer idade e qualquer area.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-lg bg-violet-600 px-6 py-3 font-medium text-white hover:bg-violet-700"
          >
            Entrar para a comunidade
          </Link>
          <Link
            href="/mentores"
            className="rounded-lg border border-stone-300 bg-white px-6 py-3 font-medium text-stone-700 hover:bg-stone-50"
          >
            Explorar mentores
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <h2 className="font-semibold text-emerald-800">Para quem esta comecando</h2>
          <p className="mt-2 text-sm text-stone-600">
            Monte sua rede com varios mentores, participe de projetos open source
            e eventos, e mostre suas contribuicoes em um perfil publico que fala
            por voce no mercado.
          </p>
        </Card>
        <Card>
          <h2 className="font-semibold text-violet-800">Para mentores</h2>
          <p className="mt-2 text-sm text-stone-600">
            Compartilhe sua experiencia, monte sua rede de mentorados e
            recomende as contribuicoes deles. Colabore tambem em projetos e
            eventos de outros especialistas.
          </p>
        </Card>
        <Card>
          <h2 className="font-semibold text-amber-800">Para empresas</h2>
          <p className="mt-2 text-sm text-stone-600">
            Atue como mentora e forme talentos do seu jeito, publique vagas e
            encontre profissionais juniores com contribuicoes reais — avaliadas
            por mentores.
          </p>
        </Card>
      </section>

      <section className="rounded-2xl bg-violet-700 px-8 py-10 text-white">
        <h2 className="text-2xl font-bold">Como funciona</h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          <li>
            <div className="text-3xl font-bold text-violet-300">1</div>
            <p className="mt-1 font-medium">Crie seu perfil</p>
            <p className="text-sm text-violet-200">
              Mentor, mentorado ou empresa — cada papel tem um espaco na rede.
            </p>
          </li>
          <li>
            <div className="text-3xl font-bold text-violet-300">2</div>
            <p className="mt-1 font-medium">Conecte-se</p>
            <p className="text-sm text-violet-200">
              Mentorados pedem mentoria; mentores aceitam e passam a fazer parte
              da mesma rede.
            </p>
          </li>
          <li>
            <div className="text-3xl font-bold text-violet-300">3</div>
            <p className="mt-1 font-medium">Construa em publico</p>
            <p className="text-sm text-violet-200">
              Contribuicoes recomendadas por mentores viram evidencia real para
              empresas que buscam talento.
            </p>
          </li>
        </ol>
      </section>
    </div>
  );
}
