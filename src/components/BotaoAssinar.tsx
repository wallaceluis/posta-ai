"use client";

import { useState } from "react";

export function BotaoAssinar({ rota, rotulo, classe = "botao w-full" }: { rota: string; rotulo: string; classe?: string }) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function ir() {
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await fetch(rota, { method: "POST" });
      const json = await resposta.json();
      if (json.url) {
        window.location.href = json.url;
        return;
      }
      setErro(json.erro ?? "Não foi possível continuar.");
    } catch {
      setErro("Sem conexão com o servidor.");
    }
    setCarregando(false);
  }

  return (
    <div>
      <button type="button" className={classe} onClick={ir} disabled={carregando}>
        {carregando ? "Abrindo…" : rotulo}
      </button>
      {erro && <p className="mt-2 text-sm text-coral-escuro">{erro}</p>}
    </div>
  );
}
