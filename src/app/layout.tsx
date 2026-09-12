import type { Metadata } from "next";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { logout } from "@/lib/actions";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ponte — mentoria entre geracoes de profissionais",
  description:
    "Comunidade que conecta profissionais experientes a pessoas em inicio de carreira ou transicao, em qualquer idade.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getSessionUser();
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-lg font-bold tracking-tight text-violet-700">
                Ponte
              </Link>
              <nav className="hidden items-center gap-4 text-sm text-stone-600 sm:flex">
                <Link href="/mentores" className="hover:text-stone-900">
                  Mentores
                </Link>
                <Link href="/talentos" className="hover:text-stone-900">
                  Talentos
                </Link>
                <Link href="/oportunidades" className="hover:text-stone-900">
                  Oportunidades
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3 text-sm">
              {user ? (
                <>
                  <Link href="/dashboard" className="font-medium text-stone-700 hover:text-stone-900">
                    {user.name.split(" ")[0]}
                  </Link>
                  <form action={logout}>
                    <button className="text-stone-500 hover:text-stone-900 cursor-pointer">
                      Sair
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-stone-600 hover:text-stone-900">
                    Entrar
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-lg bg-violet-600 px-3 py-1.5 font-medium text-white hover:bg-violet-700"
                  >
                    Criar conta
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-400">
          Ponte — comunidade aberta de mentoria. Contas de demo: ana@ponte.dev / senha123
        </footer>
      </body>
    </html>
  );
}
