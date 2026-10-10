import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <div className="mx-auto max-w-xl px-4 pt-24 text-center">
      <h1 className="font-display text-4xl font-semibold">Página não encontrada</h1>
      <Link href="/" className="botao mt-8">
        Voltar para o início
      </Link>
    </div>
  );
}
