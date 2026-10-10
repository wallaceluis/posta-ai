import assert from "node:assert/strict";
import { test } from "node:test";
import { gerarDemo } from "../src/lib/demo";
import { csvDaSemana, textoDoPost } from "../src/lib/exportar";
import { BriefingSchema, CalendarioSchema } from "../src/lib/schema";
import { ler, planoDa, serializar } from "../src/lib/sessao";
import { mesAtual } from "../src/lib/planos";

const briefing = BriefingSchema.parse({ negocio: "Padaria Pão de Mel", segmento: "Padaria", cidade: "Vila Mariana" });

test("briefing aplica padrões e rejeita negócio vazio", () => {
  assert.deepEqual(briefing.canais, ["instagram", "whatsapp"]);
  assert.equal(briefing.tom, "descontraído");
  assert.equal(BriefingSchema.safeParse({ negocio: "", segmento: "x" }).success, false);
});

test("demo respeita a quantidade de posts e o formato do calendário", () => {
  for (const n of [3, 7]) {
    const cal = gerarDemo(briefing, n);
    assert.equal(cal.posts.length, n);
    assert.ok(CalendarioSchema.safeParse(cal).success);
    assert.equal(new Set(cal.posts.map((p) => p.dia)).size, n, "dias não se repetem");
  }
});

test("demo só usa o canal pedido e não põe hashtag no WhatsApp", () => {
  const soZap = gerarDemo({ ...briefing, canais: ["whatsapp"] }, 7);
  assert.ok(soZap.posts.every((p) => p.canal === "WhatsApp" && p.hashtags.length === 0));
  const soInsta = gerarDemo({ ...briefing, canais: ["instagram"] }, 7);
  assert.ok(soInsta.posts.every((p) => p.canal === "Instagram" && !p.formato.includes("WhatsApp")));
});

test("cookie de sessão assinado não aceita adulteração", () => {
  const cookie = serializar({ mes: mesAtual(), usados: 2 });
  assert.equal(ler(cookie).usados, 2);
  const [corpo, assinatura] = cookie.split(".");
  const falso = Buffer.from(JSON.stringify({ mes: mesAtual(), usados: 0, assinatura: { status: "active" } })).toString("base64url");
  assert.equal(ler(`${falso}.${assinatura}`).usados, 0);
  assert.equal(planoDa(ler(`${falso}.${assinatura}`)), "gratis");
  assert.equal(ler(`${corpo}.x`).usados, 0);
});

test("contador zera quando o mês muda", () => {
  const cookie = serializar({ mes: "2000-01", usados: 3 });
  assert.equal(ler(cookie).usados, 0);
});

test("CSV escapa aspas e usa ponto e vírgula", () => {
  const cal = gerarDemo(briefing, 3);
  cal.posts[0].legenda = 'Diga "oi"; volte sempre';
  const csv = csvDaSemana(cal);
  assert.ok(csv.startsWith("﻿"));
  assert.ok(csv.includes('"Diga ""oi""; volte sempre"'));
  assert.equal(csv.split("\r\n").length, 4);
  assert.ok(textoDoPost(cal.posts[0]).includes("#padaria"));
});
