import { NextResponse } from "next/server";
import { criarCheckout, stripeConfigurado } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!stripeConfigurado()) {
    return NextResponse.json(
      { erro: "Pagamento ainda não configurado. Defina STRIPE_SECRET_KEY e STRIPE_PRICE_ID." },
      { status: 503 },
    );
  }
  try {
    return NextResponse.json({ url: await criarCheckout() });
  } catch (e) {
    console.error("Falha ao criar checkout", e);
    return NextResponse.json({ erro: "Não foi possível abrir o pagamento agora." }, { status: 502 });
  }
}
