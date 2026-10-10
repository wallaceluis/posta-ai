// Contador mensal por IP no Upstash Redis (opcional). Sem ele, o limite do plano
// grátis fica só no cookie assinado, o que basta para um MVP mas pode ser burlado
// limpando os cookies.
import { mesAtual } from "./planos";

export function redisConfigurado(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function comando(...args: (string | number)[]): Promise<unknown> {
  const resposta = await fetch(process.env.UPSTASH_REDIS_REST_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!resposta.ok) throw new Error(`Upstash ${resposta.status}`);
  return ((await resposta.json()) as { result: unknown }).result;
}

function chave(ip: string): string {
  return `uso:${mesAtual()}:${ip}`;
}

export async function usoDoIp(ip: string): Promise<number> {
  if (!redisConfigurado()) return 0;
  try {
    return Number((await comando("GET", chave(ip))) ?? 0);
  } catch {
    return 0;
  }
}

export async function registrarUsoDoIp(ip: string): Promise<void> {
  if (!redisConfigurado()) return;
  try {
    await comando("INCR", chave(ip));
    await comando("EXPIRE", chave(ip), 60 * 60 * 24 * 35);
  } catch {
    // Falha no contador não deve impedir a geração.
  }
}
