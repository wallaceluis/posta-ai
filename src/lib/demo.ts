// Gerador de exemplo usado quando não há chave de IA configurada. Monta a semana
// a partir de modelos fixos, só para o app funcionar de ponta a ponta.
import type { Briefing, Calendario, Post } from "./schema";

const DIAS = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

function tag(texto: string): string {
  const limpo = texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
  return limpo ? `#${limpo}` : "";
}

type Modelo = (b: Briefing, local: string) => Omit<Post, "dia" | "canal" | "hashtags" | "horario_sugerido">;

const MODELOS: Modelo[] = [
  (b, local) => ({
    formato: "post no feed",
    tema: "Apresentação do negócio",
    legenda: `Você já conhece ${b.negocio}? 👋\n\nSomos ${b.segmento.toLowerCase()}${local} e estamos aqui para facilitar o seu dia.${b.diferenciais ? `\n\nO que faz a diferença: ${b.diferenciais}.` : ""}\n\nSalva esse post para lembrar da gente!`,
    chamada_para_acao: "Salve o post e marque quem precisa conhecer.",
    sugestao_imagem: "Foto da fachada ou do balcão com a equipe sorrindo.",
    prompt_imagem: `fachada acolhedora de ${b.segmento.toLowerCase()} brasileiro, luz natural, foto realista`,
  }),
  (b) => ({
    formato: "story",
    tema: "Bastidores",
    legenda: `Bastidores de hoje por aqui ✨\n\nÉ assim que a gente prepara tudo com cuidado antes de chegar até você.`,
    chamada_para_acao: "Responda o story contando o que você quer ver por aqui.",
    sugestao_imagem: "Vídeo curto das mãos preparando um produto ou organizando o espaço.",
    prompt_imagem: `bastidores de ${b.segmento.toLowerCase()}, mãos trabalhando, close, luz quente`,
  }),
  (b) => ({
    formato: "carrossel",
    tema: "Dica útil",
    legenda: `3 dicas rápidas de quem entende de ${b.segmento.toLowerCase()} 👇\n\n1. Planeje com antecedência.\n2. Pergunte sempre a quem é do ramo.\n3. Valorize quem atende perto de você.\n\nQual dessas você já faz?`,
    chamada_para_acao: "Comente qual dica você vai usar.",
    sugestao_imagem: "Três fotos simples, uma para cada dica, com o texto escrito por cima.",
    prompt_imagem: `ilustração simples e limpa sobre dicas de ${b.segmento.toLowerCase()}, cores claras`,
  }),
  (b) => ({
    formato: "status do WhatsApp",
    tema: b.novidades ? "Novidade da semana" : "Convite para visitar",
    legenda: b.novidades
      ? `Novidade por aqui: ${b.novidades}\n\nMe chama aqui para saber mais!`
      : `Essa semana tem novidade em ${b.negocio}! Passa aqui ou me chama no WhatsApp para saber mais.`,
    chamada_para_acao: "Responda esta mensagem.",
    sugestao_imagem: "Foto do produto ou serviço em destaque, de perto e bem iluminado.",
    prompt_imagem: `produto em destaque de ${b.segmento.toLowerCase()}, fundo neutro, foto profissional`,
  }),
  (b) => ({
    formato: "reels",
    tema: "Produto ou serviço em destaque",
    legenda: `O queridinho da casa 😍\n\nSe você ainda não experimentou, essa é a semana. Valor: [preço].`,
    chamada_para_acao: "Mande DM ou chame no WhatsApp para garantir o seu.",
    sugestao_imagem: "Vídeo de 10 segundos mostrando o produto ou o antes e depois do serviço.",
    prompt_imagem: `destaque de produto de ${b.segmento.toLowerCase()}, close cinematográfico`,
  }),
  (b) => ({
    formato: "post no feed",
    tema: "Prova social",
    legenda: `Nada deixa a gente mais feliz do que cliente satisfeito 💛\n\nObrigado a todo mundo que escolhe ${b.negocio}. Já veio aqui? Conta nos comentários como foi!`,
    chamada_para_acao: "Deixe sua avaliação nos comentários.",
    sugestao_imagem: "Print de uma mensagem de cliente (com autorização) ou foto de cliente atendido.",
    prompt_imagem: `cliente feliz sendo atendido em ${b.segmento.toLowerCase()}, foto realista`,
  }),
  (b) => ({
    formato: "mensagem para lista do WhatsApp",
    tema: "Lembrete de fim de semana",
    legenda: `Oi! Aqui é da equipe ${b.negocio} 😊\n\nPassando para lembrar que estamos te esperando neste fim de semana. Quer que eu separe algo para você?`,
    chamada_para_acao: "Responda com SIM para reservar.",
    sugestao_imagem: "Foto do espaço pronto para receber os clientes.",
    prompt_imagem: `ambiente acolhedor de ${b.segmento.toLowerCase()} pronto para clientes`,
  }),
];

const HORARIOS = ["11:30", "18:00", "12:00", "09:00", "19:00", "10:00", "17:00"];

export function gerarDemo(briefing: Briefing, quantidade: number): Calendario {
  const local = briefing.cidade ? ` em ${briefing.cidade}` : "";
  const soWhatsapp = !briefing.canais.includes("instagram");
  const soInstagram = !briefing.canais.includes("whatsapp");
  // Com menos de 7 posts, fica com apresentação, novidade e destaque.
  const ordem = [0, 3, 4, 1, 2, 5, 6].slice(0, quantidade).sort((a, b) => a - b);
  const hashtags = [tag(briefing.segmento), tag(briefing.cidade), tag(briefing.negocio), "#comprelocal", "#pequenosnegocios"].filter(Boolean);

  const posts: Post[] = Array.from({ length: quantidade }, (_, i) => {
    const indice = ordem[i];
    const base = MODELOS[indice](briefing, local);
    const ehWhatsapp = base.formato.includes("WhatsApp");
    const canal: Post["canal"] = soWhatsapp ? "WhatsApp" : soInstagram ? "Instagram" : ehWhatsapp ? "WhatsApp" : "Instagram";
    const formato = canal === "WhatsApp" && !ehWhatsapp ? "status do WhatsApp" : canal === "Instagram" && ehWhatsapp ? "story" : base.formato;
    return {
      ...base,
      formato,
      dia: DIAS[indice],
      canal,
      horario_sugerido: HORARIOS[indice],
      hashtags: canal === "Instagram" ? hashtags : [],
    };
  });

  return {
    estrategia: `Semana pensada para ${briefing.objetivo}, alternando apresentação, bastidores, dica útil e oferta, no tom ${briefing.tom}.`,
    posts,
  };
}
