import type { Calendario, Post } from "./schema";

export function textoDoPost(post: Post): string {
  const partes = [post.legenda.trim()];
  if (post.hashtags.length) partes.push(post.hashtags.join(" "));
  return partes.join("\n\n");
}

export function textoDaSemana(calendario: Calendario): string {
  return calendario.posts
    .map(
      (p) =>
        `${p.dia.toUpperCase()} · ${p.horario_sugerido} · ${p.canal} (${p.formato})\nTema: ${p.tema}\n\n${textoDoPost(p)}\n\nFoto: ${p.sugestao_imagem}`,
    )
    .join("\n\n――――――――――\n\n");
}

function celula(valor: string): string {
  return `"${valor.replace(/"/g, '""')}"`;
}

// CSV com separador ";" e BOM, que é como o Excel em português abre sem bagunçar acentos.
export function csvDaSemana(calendario: Calendario): string {
  const cabecalho = ["Dia", "Horário", "Canal", "Formato", "Tema", "Legenda", "Hashtags", "Chamada", "Sugestão de imagem", "Prompt de imagem"];
  const linhas = calendario.posts.map((p) =>
    [p.dia, p.horario_sugerido, p.canal, p.formato, p.tema, p.legenda, p.hashtags.join(" "), p.chamada_para_acao, p.sugestao_imagem, p.prompt_imagem]
      .map(celula)
      .join(";"),
  );
  return "﻿" + [cabecalho.map(celula).join(";"), ...linhas].join("\r\n");
}

export function linkWhatsapp(texto: string): string {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}
