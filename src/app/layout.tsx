import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import "./globals.css";

export const metadata: Metadata = {
  title: "Posta Aí: a semana de posts do seu negócio pronta em 1 minuto",
  description:
    "Conte o que você vende e receba o calendário da semana com legendas, hashtags e ideias de foto para Instagram e WhatsApp.",
};

export const viewport: Viewport = { themeColor: "#fbf8f3" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">
        <header className="border-b border-stone-200/80">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" aria-label="Página inicial">
              <Logo />
            </Link>
            <nav className="flex items-center gap-5 text-sm font-medium text-stone-600">
              <Link href="/#como-funciona" className="hidden hover:text-tinta sm:inline">
                Como funciona
              </Link>
              <Link href="/planos" className="hover:text-tinta">
                Planos
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-24 border-t border-stone-200/80">
          <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-stone-500 sm:flex-row sm:justify-between">
            <span>© {new Date().getFullYear()} Posta Aí</span>
            <Link href="/termos" className="hover:text-tinta">
              Termos e privacidade
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
