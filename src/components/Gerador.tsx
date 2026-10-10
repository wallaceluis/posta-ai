"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { csvDaSemana, linkWhatsapp, textoDaSemana, textoDoPost } from "@/lib/exportar";
import { OBJETIVOS, TONS, type Briefing, type Calendario, type Post, type RespostaGerar } from "@/lib/schema";

type Uso = {
  plano: "gratis" | "pro";
  usados: number;
  limite: number;
  postsPorCalendario: number;
  demo: boolean;
  pagamentoAtivo: boolean;
};

const SEGMENTOS = [
  "Padaria e confeitaria",
  "Restaurante ou lanchonete",
  "Salão de beleza",
  "Barbearia",
  "Loja de roupas",
  "Pet shop",
  "Oficina mecânica",
  "Clínica ou consultório",
  "Academia ou personal",
  "Prestador de serviços",
];

const VAZIO: Briefing = {
  negocio: "",
  segmento: "",
  cidade: "",
  publico: "",
  diferenciais: "",
  novidades: "",
  tom: "descontraído",
  objetivo: "vender mais",
  canais: ["instagram", "whatsapp"],
};

const CHAVE_LOCAL = "posta-ai:briefing";
const MENSAGENS_ESPERA = [
  "Lendo o que você contou do negócio…",
  "Escolhendo os temas da semana…",
  "Escrevendo as legendas…",
  "Separando hashtags da sua região…",
  "Pensando nas fotos…",
];

function baixar(nome: string, conteudo: string, tipo: string) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

function BotaoCopiar({ texto, rotulo = "Copiar" }: { texto: string; rotulo?: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      type="button"
      className="botao-claro"
      onClick={async () => {
        await navigator.clipboard.writeText(texto);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 1600);
      }}
    >
      {copiado ? "Copiado ✓" : rotulo}
    </button>
  );
}

function CartaoPost({ post }: { post: Post }) {
  const texto = textoDoPost(post);
  const whatsapp = post.canal === "WhatsApp";
  return (
    <article className="flex flex-col rounded-xl border border-stone-200 bg-white">
      <header className="flex items-start justify-between gap-3 border-b border-stone-100 px-5 py-4">
        <div>
          <p className="font-display text-lg font-semibold">{post.dia}</p>
          <p className="text-sm text-stone-500">
            {post.horario_sugerido} · {post.formato}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            whatsapp ? "bg-folha-claro text-folha" : "bg-coral-claro text-coral-escuro"
          }`}
        >
          {post.canal}
        </span>
      </header>
      <div className="flex flex-1 flex-col gap-4 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">{post.tema}</p>
        <p className="whitespace-pre-line text-[15px] leading-relaxed">{post.legenda}</p>
        {post.hashtags.length > 0 && <p className="text-sm text-coral-escuro">{post.hashtags.join(" ")}</p>}
        <div className="mt-auto rounded-lg bg-stone-50 px-4 py-3 text-sm text-stone-600">
          <p>
            <span className="font-semibold text-stone-700">Foto: </span>
            {post.sugestao_imagem}
          </p>
          <details className="mt-1.5">
            <summary className="cursor-pointer text-stone-500">Prompt para gerar a imagem com IA</summary>
            <p className="mt-1.5 italic">{post.prompt_imagem}</p>
          </details>
        </div>
      </div>
      <footer className="flex flex-wrap gap-2 border-t border-stone-100 px-5 py-3">
        <BotaoCopiar texto={texto} rotulo="Copiar legenda" />
        {whatsapp && (
          <a className="botao-claro" href={linkWhatsapp(post.legenda)} target="_blank" rel="noreferrer">
            Abrir no WhatsApp
          </a>
        )}
      </footer>
    </article>
  );
}

export function Gerador() {
  const [briefing, setBriefing] = useState<Briefing>(VAZIO);
  const [uso, setUso] = useState<Uso | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [espera, setEspera] = useState(0);
  const [erro, setErro] = useState<{ texto: string; limite?: boolean } | null>(null);
  const [resultado, setResultado] = useState<{ calendario: Calendario; demo: boolean } | null>(null);
  const resultadoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/uso")
      .then((r) => r.json())
      .then(setUso)
      .catch(() => null);
    try {
      const salvo = localStorage.getItem(CHAVE_LOCAL);
      if (salvo) setBriefing({ ...VAZIO, ...JSON.parse(salvo) });
    } catch {
      // Sem localStorage, o formulário só começa vazio.
    }
  }, []);

  useEffect(() => {
    if (!carregando) return;
    const id = setInterval(() => setEspera((n) => (n + 1) % MENSAGENS_ESPERA.length), 2600);
    return () => clearInterval(id);
  }, [carregando]);

  function mudar<K extends keyof Briefing>(campo: K, valor: Briefing[K]) {
    setBriefing((b) => ({ ...b, [campo]: valor }));
  }

  function alternarCanal(canal: "instagram" | "whatsapp") {
    const tem = briefing.canais.includes(canal);
    if (tem && briefing.canais.length === 1) return;
    mudar("canais", tem ? briefing.canais.filter((c) => c !== canal) : [...briefing.canais, canal]);
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    setEspera(0);
    try {
      localStorage.setItem(CHAVE_LOCAL, JSON.stringify(briefing));
    } catch {
      // Ignora: salvar o formulário é só conveniência.
    }
    try {
      const resposta = await fetch("/api/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(briefing),
      });
      const json = await resposta.json();
      if (!resposta.ok) {
        setErro({ texto: json.erro ?? "Algo deu errado.", limite: json.limiteAtingido });
        return;
      }
      const dados = json as RespostaGerar;
      setResultado({ calendario: dados.calendario, demo: dados.demo });
      setUso((u) => (u ? { ...u, usados: dados.uso.usados, limite: dados.uso.limite } : u));
      setTimeout(() => resultadoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch {
      setErro({ texto: "Sem conexão com o servidor. Tente de novo." });
    } finally {
      setCarregando(false);
    }
  }

  const restantes = uso ? Math.max(0, uso.limite - uso.usados) : null;
  const pro = uso?.plano === "pro";

  return (
    <div>
      <form onSubmit={enviar} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="rotulo" htmlFor="negocio">
              Nome do negócio
            </label>
            <input
              id="negocio"
              className="campo"
              required
              maxLength={80}
              placeholder="Ex.: Padaria Pão de Mel"
              value={briefing.negocio}
              onChange={(e) => mudar("negocio", e.target.value)}
            />
          </div>
          <div>
            <label className="rotulo" htmlFor="segmento">
              Segmento
            </label>
            <input
              id="segmento"
              className="campo"
              required
              maxLength={60}
              list="segmentos"
              placeholder="Ex.: Padaria e confeitaria"
              value={briefing.segmento}
              onChange={(e) => mudar("segmento", e.target.value)}
            />
            <datalist id="segmentos">
              {SEGMENTOS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="rotulo" htmlFor="cidade">
              Cidade ou bairro <span className="font-normal text-stone-400">(opcional)</span>
            </label>
            <input
              id="cidade"
              className="campo"
              maxLength={60}
              placeholder="Ex.: Vila Mariana, São Paulo"
              value={briefing.cidade}
              onChange={(e) => mudar("cidade", e.target.value)}
            />
          </div>
          <div>
            <label className="rotulo" htmlFor="publico">
              Quem são seus clientes <span className="font-normal text-stone-400">(opcional)</span>
            </label>
            <input
              id="publico"
              className="campo"
              maxLength={160}
              placeholder="Ex.: famílias do bairro e quem trabalha por perto"
              value={briefing.publico}
              onChange={(e) => mudar("publico", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="rotulo" htmlFor="diferenciais">
              O que vocês fazem de melhor <span className="font-normal text-stone-400">(opcional)</span>
            </label>
            <input
              id="diferenciais"
              className="campo"
              maxLength={300}
              placeholder="Ex.: pão de fermentação natural, entrega no bairro, aberto aos domingos"
              value={briefing.diferenciais}
              onChange={(e) => mudar("diferenciais", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="rotulo" htmlFor="novidades">
              Alguma promoção ou novidade nesta semana? <span className="font-normal text-stone-400">(opcional)</span>
            </label>
            <textarea
              id="novidades"
              className="campo min-h-[76px]"
              maxLength={300}
              placeholder="Ex.: bolo de cenoura com 20% de desconto na quarta"
              value={briefing.novidades}
              onChange={(e) => mudar("novidades", e.target.value)}
            />
          </div>
          <div>
            <label className="rotulo" htmlFor="tom">
              Jeito de falar
            </label>
            <select id="tom" className="campo" value={briefing.tom} onChange={(e) => mudar("tom", e.target.value as Briefing["tom"])}>
              {TONS.map((t) => (
                <option key={t} value={t}>
                  {t[0].toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="rotulo" htmlFor="objetivo">
              Objetivo da semana
            </label>
            <select
              id="objetivo"
              className="campo"
              value={briefing.objetivo}
              onChange={(e) => mudar("objetivo", e.target.value as Briefing["objetivo"])}
            >
              {OBJETIVOS.map((o) => (
                <option key={o} value={o}>
                  {o[0].toUpperCase() + o.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <fieldset className="sm:col-span-2">
            <legend className="rotulo">Onde você vai postar</legend>
            <div className="flex flex-wrap gap-2">
              {(["instagram", "whatsapp"] as const).map((canal) => {
                const ativo = briefing.canais.includes(canal);
                return (
                  <button
                    key={canal}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => alternarCanal(canal)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      ativo ? "border-tinta bg-tinta text-white" : "border-stone-300 bg-white text-stone-600 hover:border-tinta"
                    }`}
                  >
                    {canal === "instagram" ? "Instagram" : "WhatsApp"}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-stone-500">
            {uso
              ? pro
                ? `Plano Pro · ${uso.postsPorCalendario} posts por semana`
                : `Plano grátis · ${restantes} de ${uso.limite} calendários restantes este mês · ${uso.postsPorCalendario} posts cada`
              : " "}
          </p>
          <button className="botao w-full sm:w-auto" disabled={carregando}>
            {carregando ? MENSAGENS_ESPERA[espera] : "Gerar minha semana de posts"}
          </button>
        </div>

        {erro && (
          <div role="alert" className="mt-4 rounded-lg border border-coral/40 bg-coral-claro px-4 py-3 text-sm text-coral-escuro">
            {erro.texto}{" "}
            {erro.limite && (
              <Link href="/planos" className="font-semibold underline">
                Ver o plano Pro
              </Link>
            )}
          </div>
        )}
      </form>

      {resultado && (
        <section ref={resultadoRef} className="mt-12 scroll-mt-6" aria-live="polite">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-3xl font-semibold">Sua semana está pronta</h2>
              <p className="mt-2 max-w-2xl text-stone-600">{resultado.calendario.estrategia}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <BotaoCopiar texto={textoDaSemana(resultado.calendario)} rotulo="Copiar a semana" />
              {pro ? (
                <button
                  type="button"
                  className="botao-claro"
                  onClick={() => baixar("semana-de-posts.csv", csvDaSemana(resultado.calendario), "text/csv;charset=utf-8")}
                >
                  Baixar planilha
                </button>
              ) : (
                <Link href="/planos" className="botao-claro" title="Disponível no plano Pro">
                  Baixar planilha · Pro
                </Link>
              )}
            </div>
          </div>
          {resultado.demo && (
            <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Modo demonstração: estes textos vêm de modelos prontos. Configure a chave da API de IA para gerar posts
              personalizados.
            </p>
          )}
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {resultado.calendario.posts.map((post, i) => (
              <CartaoPost key={i} post={post} />
            ))}
          </div>
          {!pro && (
            <div className="mt-8 flex flex-col items-start gap-3 rounded-xl border border-stone-200 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-stone-700">
                <strong>Quer um post para cada dia?</strong> No Pro são 7 posts por semana, até 60 calendários por mês e planilha
                para organizar tudo.
              </p>
              <Link href="/planos" className="botao shrink-0">
                Conhecer o Pro
              </Link>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
