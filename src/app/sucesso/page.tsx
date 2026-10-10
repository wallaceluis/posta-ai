import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// O Stripe volta para cá; a rota de API confirma o pagamento e grava o cookie do Pro.
export default async function Sucesso({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  redirect(session_id ? `/api/assinatura/confirmar?session_id=${encodeURIComponent(session_id)}` : "/planos");
}
