import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESSAO, opcoesCookie, serializar } from "@/lib/sessao";
import { lerAssinatura, lerCheckout, stripeConfigurado, urlDoSite } from "@/lib/stripe";
import { sessaoAtual } from "@/lib/uso";

export const dynamic = "force-dynamic";

// Chamado pela página /sucesso depois do checkout: confere no Stripe e libera o Pro neste navegador.
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("session_id");
  if (!id || !stripeConfigurado()) return NextResponse.redirect(`${urlDoSite()}/planos`);

  try {
    const checkout = await lerCheckout(id);
    if (checkout.status !== "complete" || !checkout.subscription || !checkout.customer) {
      return NextResponse.redirect(`${urlDoSite()}/planos?erro=pagamento`);
    }
    const assinatura = await lerAssinatura(checkout.subscription);
    const { sessao } = await sessaoAtual(req);
    const resposta = NextResponse.redirect(`${urlDoSite()}/?pro=1`);
    resposta.cookies.set(
      COOKIE_SESSAO,
      serializar({
        ...sessao,
        usados: 0,
        assinatura: { cliente: checkout.customer, id: assinatura.id, status: assinatura.status, verificadoEm: Date.now() },
      }),
      opcoesCookie,
    );
    return resposta;
  } catch (e) {
    console.error("Falha ao confirmar assinatura", e);
    return NextResponse.redirect(`${urlDoSite()}/planos?erro=pagamento`);
  }
}
