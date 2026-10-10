import { createHmac, timingSafeEqual } from "node:crypto";
import { mesAtual, type Plano } from "./planos";

export const COOKIE_SESSAO = "pa_sessao";
const UM_ANO = 60 * 60 * 24 * 365;

export type Sessao = {
  mes: string;
  usados: number;
  assinatura?: {
    cliente: string;
    id: string;
    status: string;
    verificadoEm: number;
  };
};

export function segredoConfigurado(): boolean {
  return process.env.NODE_ENV !== "production" || (process.env.SESSION_SECRET ?? "").length >= 16;
}

function segredo(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("Defina SESSION_SECRET (pelo menos 16 caracteres) nas variáveis de ambiente.");
  }
  return "segredo-de-desenvolvimento-nao-use-em-producao";
}

function assinar(valor: string): string {
  return createHmac("sha256", segredo()).update(valor).digest("base64url");
}

export function serializar(sessao: Sessao): string {
  const corpo = Buffer.from(JSON.stringify(sessao)).toString("base64url");
  return `${corpo}.${assinar(corpo)}`;
}

export function ler(cookie: string | undefined): Sessao {
  const vazia: Sessao = { mes: mesAtual(), usados: 0 };
  if (!cookie) return vazia;
  const [corpo, assinatura] = cookie.split(".");
  if (!corpo || !assinatura) return vazia;
  const esperada = Buffer.from(assinar(corpo));
  const recebida = Buffer.from(assinatura);
  if (esperada.length !== recebida.length || !timingSafeEqual(esperada, recebida)) return vazia;
  try {
    const sessao = JSON.parse(Buffer.from(corpo, "base64url").toString()) as Sessao;
    // O contador zera quando o mês vira.
    if (sessao.mes !== mesAtual()) return { ...sessao, mes: mesAtual(), usados: 0 };
    return sessao;
  } catch {
    return vazia;
  }
}

export function planoDa(sessao: Sessao): Plano {
  const status = sessao.assinatura?.status;
  return status === "active" || status === "trialing" ? "pro" : "gratis";
}

export const opcoesCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: UM_ANO,
};
