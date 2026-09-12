import Link from "next/link";
import { login } from "@/lib/actions";
import { Card, Flash, inputCls, btnCls } from "@/components/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-sm py-10">
      <Card>
        <h1 className="text-xl font-bold">Entrar na Ponte</h1>
        <div className="mt-4">
          <Flash params={sp} />
        </div>
        <form action={login} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input name="email" type="email" required className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Senha</label>
            <input name="password" type="password" required className={inputCls} />
          </div>
          <button type="submit" className={`${btnCls} w-full`}>
            Entrar
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          Ainda nao tem conta?{" "}
          <Link href="/signup" className="text-accent hover:underline">
            Criar conta
          </Link>
        </p>
      </Card>
    </div>
  );
}
