import { z } from "zod";

export const TONS = ["descontraído", "profissional", "acolhedor", "divertido", "sofisticado"] as const;
export const OBJETIVOS = [
  "vender mais",
  "atrair novos clientes",
  "engajar quem já é cliente",
  "divulgar uma promoção",
  "lançar um produto ou serviço",
] as const;
export const CANAIS = ["instagram", "whatsapp"] as const;

export const BriefingSchema = z.object({
  negocio: z.string().trim().min(2, "Informe o nome do negócio").max(80),
  segmento: z.string().trim().min(2, "Informe o segmento").max(60),
  cidade: z.string().trim().max(60).optional().default(""),
  publico: z.string().trim().max(160).optional().default(""),
  diferenciais: z.string().trim().max(300).optional().default(""),
  novidades: z.string().trim().max(300).optional().default(""),
  tom: z.enum(TONS).default("descontraído"),
  objetivo: z.enum(OBJETIVOS).default("vender mais"),
  canais: z.array(z.enum(CANAIS)).min(1, "Escolha ao menos um canal").default(["instagram", "whatsapp"]),
});
export type Briefing = z.infer<typeof BriefingSchema>;

export const FORMATOS = ["post no feed", "carrossel", "reels", "story", "status do WhatsApp", "mensagem para lista do WhatsApp"] as const;

export const PostSchema = z.object({
  dia: z.string().describe("Dia da semana, por exemplo Segunda-feira"),
  canal: z.enum(["Instagram", "WhatsApp"]),
  formato: z.enum(FORMATOS),
  horario_sugerido: z.string().describe("Horário no formato HH:MM"),
  tema: z.string().describe("Tema do post em poucas palavras"),
  legenda: z.string().describe("Texto pronto para publicar, com quebras de linha e emojis com moderação"),
  hashtags: z.array(z.string()).describe("Hashtags sem espaço, começando com #; lista vazia para WhatsApp"),
  chamada_para_acao: z.string().describe("Frase curta pedindo uma ação ao leitor"),
  sugestao_imagem: z.string().describe("O que fotografar ou mostrar, em linguagem simples"),
  prompt_imagem: z.string().describe("Prompt curto para gerar a imagem em uma ferramenta de IA"),
});
export type Post = z.infer<typeof PostSchema>;

export const CalendarioSchema = z.object({
  estrategia: z.string().describe("Duas ou três frases explicando a lógica da semana"),
  posts: z.array(PostSchema),
});
export type Calendario = z.infer<typeof CalendarioSchema>;

export type RespostaGerar = {
  calendario: Calendario;
  demo: boolean;
  uso: { usados: number; limite: number; plano: "gratis" | "pro" };
};
