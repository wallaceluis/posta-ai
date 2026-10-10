import type { Metadata } from "next";

export const metadata: Metadata = { title: "Termos e privacidade · Posta Aí" };

export default function Termos() {
  return (
    <article className="mx-auto max-w-2xl px-4 pt-12 leading-relaxed text-stone-700">
      <h1 className="font-display text-4xl font-semibold text-tinta">Termos e privacidade</h1>
      <p className="mt-2 text-sm text-stone-500">Versão de rascunho do MVP. Revise com um advogado antes de lançar.</p>

      <h2 className="mt-8 text-lg font-semibold text-tinta">O que o Posta Aí faz</h2>
      <p className="mt-2">
        Gera sugestões de posts e legendas com inteligência artificial a partir das informações que você digita. Os
        textos são sugestões: confira antes de publicar, principalmente preços, datas e promoções.
      </p>

      <h2 className="mt-8 text-lg font-semibold text-tinta">Dados</h2>
      <p className="mt-2">
        Não pedimos cadastro. As informações do formulário são enviadas ao provedor de IA só para gerar a resposta e não
        são guardadas por nós. Um cookie guarda quantos calendários você gerou no mês e, se for assinante, o identificador
        da assinatura. Pagamentos são processados pelo Stripe; não temos acesso aos dados do seu cartão.
      </p>

      <h2 className="mt-8 text-lg font-semibold text-tinta">Assinatura</h2>
      <p className="mt-2">
        O plano Pro é mensal e renova automaticamente. Você pode cancelar a qualquer momento na área do assinante, e o
        acesso continua até o fim do período pago.
      </p>
    </article>
  );
}
