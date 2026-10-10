import { NextResponse, type NextRequest } from "next/server";
import { iaConfigurada } from "@/lib/ia";
import { PLANOS } from "@/lib/planos";
import { COOKIE_SESSAO, opcoesCookie, serializar } from "@/lib/sessao";
import { stripeConfigurado } from "@/lib/stripe";
import { planoDa, sessaoAtual } from "@/lib/uso";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { sessao, mudou } = await sessaoAtual(req);
  const plano = planoDa(sessao);
  const resposta = NextResponse.json({
    plano,
    usados: sessao.usados,
    limite: PLANOS[plano].calendariosPorMes,
    postsPorCalendario: PLANOS[plano].postsPorCalendario,
    demo: !iaConfigurada(),
    pagamentoAtivo: stripeConfigurado(),
  });
  if (mudou) resposta.cookies.set(COOKIE_SESSAO, serializar(sessao), opcoesCookie);
  return resposta;
}
