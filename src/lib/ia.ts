import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { CalendarioSchema, type Briefing, type Calendario } from "./schema";

export function iaConfigurada(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const MODELO_PADRAO = "claude-opus-5-5";
// Modelos que aceitam o fallback automático do servidor quando um pedido é recusado.
const ACEITAM_FALLBACK = ["claude-opus-5-5", "claude-opus-5", "claude-fable-5-1", "claude-sonnet-5-5"];

const SISTEMA = `Você é social media de pequenos negócios brasileiros: padarias, salões, oficinas, lojas de bairro, clínicas, restaurantes, prestadores de serviço.
Você monta a semana de conteúdo do negócio para Instagram e WhatsApp.

Como escrever:
- Português do Brasil, natural, como o próprio dono falaria com o cliente. Nada de jargão de marketing ("engajamento", "storytelling", "alavancar").
- Legendas prontas para copiar e colar, com quebras de linha. Emojis com moderação, combinando com o tom pedido.
- Varie os formatos e os temas ao longo da semana: bastidores, produto ou serviço em destaque, prova social, dica útil, oferta, pergunta para o público.
- Sempre que fizer sentido, cite o bairro ou a cidade para atrair gente da região.
- Não invente preços, prêmios, depoimentos com nome, nem promoções que o dono não informou. Se precisar de um valor, escreva [preço] para o dono preencher.
- Instagram: 5 a 10 hashtags relevantes, misturando gerais e locais.
- WhatsApp: sem hashtags; texto mais curto e direto, com convite para responder a mensagem.
- Sugestão de imagem em linguagem simples, algo que o dono consiga fotografar com o celular. O prompt de imagem é para quem preferir gerar por IA.
- Horários realistas para o público do segmento.`;

function pedido(briefing: Briefing, quantidade: number): string {
  const canais = briefing.canais.map((c) => (c === "instagram" ? "Instagram" : "WhatsApp")).join(" e ");
  const linhas = [
    `Negócio: ${briefing.negocio}`,
    `Segmento: ${briefing.segmento}`,
    briefing.cidade && `Cidade ou bairro: ${briefing.cidade}`,
    briefing.publico && `Público: ${briefing.publico}`,
    briefing.diferenciais && `Diferenciais: ${briefing.diferenciais}`,
    briefing.novidades && `Novidades ou promoções desta semana: ${briefing.novidades}`,
    `Tom de voz: ${briefing.tom}`,
    `Objetivo da semana: ${briefing.objetivo}`,
    `Canais: ${canais}`,
  ].filter(Boolean);
  return `${linhas.join("\n")}

Monte ${quantidade} posts para esta semana, em dias diferentes, de segunda a domingo, usando só os canais pedidos.`;
}

export class RecusaDaIA extends Error {}

export async function gerarComIA(briefing: Briefing, quantidade: number): Promise<Calendario> {
  const cliente = new Anthropic();
  const modelo = process.env.AI_MODEL || MODELO_PADRAO;
  const usaFallback = ACEITAM_FALLBACK.includes(modelo);

  const resposta = await cliente.beta.messages.parse({
    model: modelo,
    max_tokens: 16000,
    system: SISTEMA,
    messages: [{ role: "user", content: pedido(briefing, quantidade) }],
    output_config: { effort: "medium", format: betaZodOutputFormat(CalendarioSchema) },
    ...(usaFallback ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
  });

  if (resposta.stop_reason === "refusal") {
    throw new RecusaDaIA("A IA não conseguiu gerar posts para esse pedido. Revise o texto e tente de novo.");
  }
  const calendario = resposta.parsed_output;
  if (!calendario) throw new Error("A resposta da IA veio incompleta.");
  return { ...calendario, posts: calendario.posts.slice(0, quantidade) };
}
