// Chamadas mínimas à API REST do Stripe, sem SDK, para manter o projeto leve.
const API = "https://api.stripe.com/v1";

export function stripeConfigurado(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);
}

async function stripe<T>(caminho: string, metodo: "GET" | "POST", corpo?: Record<string, string>): Promise<T> {
  const resposta = await fetch(`${API}${caminho}`, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: corpo ? new URLSearchParams(corpo).toString() : undefined,
    cache: "no-store",
  });
  const json = await resposta.json();
  if (!resposta.ok) {
    throw new Error(`Stripe ${resposta.status}: ${json?.error?.message ?? "erro desconhecido"}`);
  }
  return json as T;
}

export function urlDoSite(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export async function criarCheckout(): Promise<string> {
  const sessao = await stripe<{ url: string }>("/checkout/sessions", "POST", {
    mode: "subscription",
    "line_items[0][price]": process.env.STRIPE_PRICE_ID!,
    "line_items[0][quantity]": "1",
    success_url: `${urlDoSite()}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${urlDoSite()}/planos`,
    locale: "pt-BR",
    allow_promotion_codes: "true",
    billing_address_collection: "auto",
  });
  return sessao.url;
}

type CheckoutSession = {
  status: string;
  customer: string | null;
  subscription: string | null;
};

type Subscription = { id: string; status: string; customer: string };

export async function lerCheckout(id: string): Promise<CheckoutSession> {
  return stripe<CheckoutSession>(`/checkout/sessions/${encodeURIComponent(id)}`, "GET");
}

export async function lerAssinatura(id: string): Promise<Subscription> {
  return stripe<Subscription>(`/subscriptions/${encodeURIComponent(id)}`, "GET");
}

export async function criarPortal(cliente: string): Promise<string> {
  const portal = await stripe<{ url: string }>("/billing_portal/sessions", "POST", {
    customer: cliente,
    return_url: `${urlDoSite()}/`,
  });
  return portal.url;
}
