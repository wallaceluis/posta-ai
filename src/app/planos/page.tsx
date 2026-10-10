import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { BotaoAssinar } from "@/components/BotaoAssinar";
import { PLANOS } from "@/lib/planos";
import { COOKIE_SESSAO, ler, planoDa } from "@/lib/sessao";

export const metadata: Metadata = { title: "Planos · Posta Aí" };
export const dynamic = "force-dynamic";

const PERGUNTAS = [
  {
    p: "Preciso instalar alguma coisa?",
    r: "Não. Funciona no navegador do celular ou do computador.",
  },
  {
    p: "Posso cancelar quando quiser?",
    r: "Pode. O cancelamento é feito na área do assinante, sem multa, e o Pro fica ativo até o fim do mês pago.",
  },
  {
    p: "Os textos saem iguais para todo mundo?",
    r: "Não. Cada semana é escrita a partir do que você conta do seu negócio, da sua cidade e das promoções da semana.",
  },
  {
    p: "Vocês postam por mim?",
    r: "Não. Você copia e posta no seu perfil, do seu jeito. Assim nada é publicado sem você ver antes.",
  },
];

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="text-folha" aria-hidden="true">
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}

export default async function Planos({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const sessao = ler((await cookies()).get(COOKIE_SESSAO)?.value);
  const pro = planoDa(sessao) === "pro";

  return (
    <div className="mx-auto max-w-5xl px-4 pt-12">
      <h1 className="font-display text-4xl font-semibold">Planos</h1>
      <p className="mt-3 max-w-xl text-lg text-stone-600">Comece de graça. Assine quando quiser um post para cada dia.</p>

      {erro && (
        <p className="mt-6 rounded-lg bg-coral-claro px-4 py-3 text-sm text-coral-escuro">
          O pagamento não foi concluído. Nenhum valor foi cobrado; tente de novo quando quiser.
        </p>
      )}

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="flex flex-col rounded-2xl border border-stone-200 bg-white p-7">
          <h2 className="text-lg font-semibold">{PLANOS.gratis.nome}</h2>
          <p className="mt-2 font-display text-4xl font-semibold">{PLANOS.gratis.preco}</p>
          <ul className="mt-6 flex-1 space-y-2.5 text-stone-700">
            <Item>{PLANOS.gratis.calendariosPorMes} calendários por mês</Item>
            <Item>{PLANOS.gratis.postsPorCalendario} posts por calendário</Item>
            <Item>Legenda, hashtags e ideia de foto</Item>
            <Item>Copiar e mandar no WhatsApp</Item>
          </ul>
          <Link href="/" className="botao-claro mt-8 w-full py-3 text-[15px]">
            Usar grátis
          </Link>
        </div>

        <div className="flex flex-col rounded-2xl border-2 border-tinta bg-white p-7">
          <h2 className="text-lg font-semibold">{PLANOS.pro.nome}</h2>
          <p className="mt-2 font-display text-4xl font-semibold">{PLANOS.pro.preco}</p>
          <ul className="mt-6 flex-1 space-y-2.5 text-stone-700">
            <Item>Até {PLANOS.pro.calendariosPorMes} calendários por mês</Item>
            <Item>{PLANOS.pro.postsPorCalendario} posts por semana, um para cada dia</Item>
            <Item>Planilha da semana para organizar e agendar</Item>
            <Item>Tudo do plano grátis</Item>
          </ul>
          <div className="mt-8">
            {pro ? (
              <BotaoAssinar rota="/api/portal" rotulo="Gerenciar assinatura" classe="botao-claro w-full py-3 text-[15px]" />
            ) : (
              <BotaoAssinar rota="/api/checkout" rotulo="Assinar o Pro" />
            )}
          </div>
        </div>
      </div>

      <section className="mt-20">
        <h2 className="font-display text-2xl font-semibold">Perguntas frequentes</h2>
        <dl className="mt-6 divide-y divide-stone-200 border-y border-stone-200">
          {PERGUNTAS.map(({ p, r }) => (
            <div key={p} className="py-5">
              <dt className="font-semibold">{p}</dt>
              <dd className="mt-1 text-stone-600">{r}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
