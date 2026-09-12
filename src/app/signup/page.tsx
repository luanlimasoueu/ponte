import Link from "next/link";
import { signup } from "@/lib/actions";
import { Card, Flash, inputCls, btnCls } from "@/components/ui";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-md py-8">
      <Card>
        <h1 className="text-xl font-bold">Criar conta na Ponte</h1>
        <div className="mt-4">
          <Flash params={sp} />
        </div>
        <form action={signup} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Eu sou *</label>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex cursor-pointer flex-col rounded-md border border-line p-3 text-sm transition-colors has-checked:border-accent has-checked:bg-accent/10">
                <input type="radio" name="role" value="mentee" required className="sr-only" />
                <span className="font-medium">Mentorado</span>
                <span className="text-xs text-muted">Inicio ou transicao de carreira</span>
              </label>
              <label className="flex cursor-pointer flex-col rounded-md border border-line p-3 text-sm transition-colors has-checked:border-accent has-checked:bg-accent/10">
                <input type="radio" name="role" value="mentor" className="sr-only" />
                <span className="font-medium">Mentor</span>
                <span className="text-xs text-muted">Profissional experiente</span>
              </label>
              <label className="flex cursor-pointer flex-col rounded-md border border-line p-3 text-sm transition-colors has-checked:border-accent has-checked:bg-accent/10">
                <input type="radio" name="role" value="company" className="sr-only" />
                <span className="font-medium">Empresa</span>
                <span className="text-xs text-muted">Mentora e contrata talentos</span>
              </label>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Nome *</label>
            <input name="name" required className={inputCls} placeholder="Seu nome ou da empresa" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email *</label>
            <input name="email" type="email" required className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Senha *</label>
            <input name="password" type="password" required minLength={6} className={inputCls} placeholder="Minimo 6 caracteres" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Titulo / resumo</label>
            <input
              name="headline"
              className={inputCls}
              placeholder="Ex.: Engenheira senior · 15 anos / Em transicao para dados"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Especialidades / interesses</label>
            <input
              name="skills"
              className={inputCls}
              placeholder="Ex.: Python, Dados, Carreira (separados por virgula)"
            />
          </div>
          <button type="submit" className={`${btnCls} w-full`}>
            Criar conta
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          Ja tem conta?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Entrar
          </Link>
        </p>
      </Card>
    </div>
  );
}
