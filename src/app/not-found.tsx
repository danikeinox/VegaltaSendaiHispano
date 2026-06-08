import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-vegalta-blue text-white gap-6 px-4">
      <h1 className="text-6xl font-black text-vegalta-gold">404</h1>
      <p className="text-white/70 text-center max-w-md">
        No encontramos la página o el carnet que buscas.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-md bg-vegalta-gold text-vegalta-blue font-semibold hover:bg-vegalta-yellow transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
