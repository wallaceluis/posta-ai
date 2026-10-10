export type Plano = "gratis" | "pro";

export const PLANOS = {
  gratis: {
    nome: "Grátis",
    preco: "R$ 0",
    calendariosPorMes: 3,
    postsPorCalendario: 3,
    exportarCsv: false,
  },
  pro: {
    nome: "Pro",
    preco: "R$ 29,90/mês",
    calendariosPorMes: 60,
    postsPorCalendario: 7,
    exportarCsv: true,
  },
} as const;

export function mesAtual(agora = new Date()): string {
  return agora.toISOString().slice(0, 7);
}
