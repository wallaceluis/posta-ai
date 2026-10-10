import { NextResponse, type NextRequest } from "next/server";
import { criarPortal, stripeConfigurado } from "@/lib/stripe";
import { sessaoAtual } from "@/lib/uso";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { sessao } = await sessaoAtual(req);
  if (!stripeConfigurado() || !sessao.assinatura) {
    return NextResponse.json({ erro: "Nenhuma assinatura encontrada neste navegador." }, { status: 404 });
  }
  try {
    return NextResponse.json({ url: await criarPortal(sessao.assinatura.cliente) });
  } catch (e) {
    console.error("Falha ao abrir portal", e);
    return NextResponse.json({ erro: "Não foi possível abrir a área do assinante agora." }, { status: 502 });
  }
}
