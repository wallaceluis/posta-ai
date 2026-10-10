import type { NextRequest } from "next/server";
import { COOKIE_SESSAO, ler, planoDa, type Sessao } from "./sessao";
import { lerAssinatura, stripeConfigurado } from "./stripe";

const UM_DIA = 24 * 60 * 60 * 1000;

export function ipDe(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

// Lê a sessão do cookie e, uma vez por dia, confere no Stripe se a assinatura continua ativa.
export async function sessaoAtual(req: NextRequest): Promise<{ sessao: Sessao; mudou: boolean }> {
  const sessao = ler(req.cookies.get(COOKIE_SESSAO)?.value);
  const assinatura = sessao.assinatura;
  if (!assinatura || !stripeConfigurado() || Date.now() - assinatura.verificadoEm < UM_DIA) {
    return { sessao, mudou: false };
  }
  try {
    const atual = await lerAssinatura(assinatura.id);
    return {
      sessao: { ...sessao, assinatura: { ...assinatura, status: atual.status, verificadoEm: Date.now() } },
      mudou: true,
    };
  } catch {
    // Se o Stripe estiver fora do ar, mantém o status anterior até a próxima verificação.
    return { sessao, mudou: false };
  }
}

export { planoDa };
