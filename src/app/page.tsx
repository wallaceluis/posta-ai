import { Gerador } from "@/components/Gerador";

const PASSOS = [
  {
    titulo: "Conte do seu negócio",
    texto: "Nome, segmento, bairro e o que tem de novidade. Leva um minuto.",
  },
  {
    titulo: "Receba a semana pronta",
    texto: "Dia, horário, legenda, hashtags e ideia de foto para cada post.",
  },
  {
    titulo: "Copie e poste",
    texto: "Um toque para copiar a legenda ou mandar direto no WhatsApp.",
  },
];

export default async function Inicio({ searchParams }: { searchParams: Promise<{ pro?: string }> }) {
  const { pro } = await searchParams;
  return (
    <div className="mx-auto max-w-5xl px-4">
      {pro && (
        <p className="mt-6 rounded-lg bg-folha-claro px-4 py-3 text-sm font-medium text-folha">
          Assinatura confirmada. O plano Pro já está ativo neste navegador.
        </p>
      )}
      <section className="pb-10 pt-12 sm:pt-16">
        <p className="text-sm font-semibold uppercase tracking-wider text-coral">Para quem não tem tempo de pensar em post</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-[1.1] sm:text-5xl">
          A semana de posts do seu negócio, pronta antes do café esfriar.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-stone-600">
          Legendas para Instagram e mensagens para WhatsApp escritas do jeito que você fala com seu cliente, com hashtags
          da sua região e ideia de foto para tirar com o celular.
        </p>
      </section>

      <Gerador />

      <section id="como-funciona" className="mt-24 scroll-mt-6">
        <h2 className="font-display text-3xl font-semibold">Como funciona</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {PASSOS.map((passo, i) => (
            <li key={passo.titulo} className="border-t-2 border-tinta pt-4">
              <span className="font-display text-2xl text-coral">{i + 1}</span>
              <h3 className="mt-1 text-lg font-semibold">{passo.titulo}</h3>
              <p className="mt-1 text-stone-600">{passo.texto}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
