import Anthropic from "@anthropic-ai/sdk";
import { NextResponse, type NextRequest } from "next/server";
import { gerarDemo } from "@/lib/demo";
import { gerarComIA, iaConfigurada, RecusaDaIA } from "@/lib/ia";
import { registrarUsoDoIp, usoDoIp } from "@/lib/limite";
import { PLANOS } from "@/lib/planos";
import { BriefingSchema, type RespostaGerar } from "@/lib/schema";
import { COOKIE_SESSAO, opcoesCookie, segredoConfigurado, serializar } from "@/lib/sessao";
import { ipDe, planoDa, sessaoAtual } from "@/lib/uso";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

function erro(mensagem: string, status: number, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ erro: mensagem, ...extra }, { status });
}

export async function POST(req: NextRequest) {
  if (!segredoConfigurado()) {
    console.error("SESSION_SECRET ausente ou curto demais");
    return erro("O site ainda não foi configurado. Defina SESSION_SECRET na hospedagem.", 503);
  }
  const corpo = await req.json().catch(() => null);
  const briefing = BriefingSchema.safeParse(corpo);
  if (!briefing.success) {
    return erro(briefing.error.issues[0]?.message ?? "Dados inválidos.", 400);
  }

  const { sessao } = await sessaoAtual(req);
  const plano = planoDa(sessao);
  const regras = PLANOS[plano];
  const ip = ipDe(req);
  const usadosNoIp = plano === "gratis" ? await usoDoIp(ip) : 0;

  if (sessao.usados >= regras.calendariosPorMes || usadosNoIp >= regras.calendariosPorMes) {
    return erro(
      plano === "gratis"
        ? `Você já usou os ${regras.calendariosPorMes} calendários grátis deste mês. Assine o Pro para continuar.`
        : "Você chegou ao limite de uso justo do mês. Fale com a gente se precisar de mais.",
      402,
      { limiteAtingido: true },
    );
  }

  const demo = !iaConfigurada();
  let calendario;
  try {
    calendario = demo
      ? gerarDemo(briefing.data, regras.postsPorCalendario)
      : await gerarComIA(briefing.data, regras.postsPorCalendario);
  } catch (e) {
    if (e instanceof RecusaDaIA) return erro(e.message, 422);
    if (e instanceof Anthropic.RateLimitError) return erro("Muita gente gerando agora. Tente de novo em instantes.", 429);
    if (e instanceof Anthropic.AuthenticationError) {
      console.error("Chave da Anthropic inválida");
      return erro("O serviço de IA não está configurado corretamente.", 503);
    }
    console.error("Falha ao gerar calendário", e);
    return erro("Não foi possível gerar agora. Tente de novo em instantes.", 502);
  }

  const nova = { ...sessao, usados: sessao.usados + 1 };
  if (plano === "gratis") await registrarUsoDoIp(ip);

  const corpoResposta: RespostaGerar = {
    calendario,
    demo,
    uso: { usados: nova.usados, limite: regras.calendariosPorMes, plano },
  };
  const resposta = NextResponse.json(corpoResposta);
  resposta.cookies.set(COOKIE_SESSAO, serializar(nova), opcoesCookie);
  return resposta;
}
