export function Footer() {
  return (
    <footer className="w-full border-t border-vegalta-gold/20 bg-vegalta-blue mt-auto">
      <div className="container mx-auto px-4 py-8 text-center text-white/50 text-sm space-y-2">
        <p>
          Comunidad Hispana de Fans del Vegalta Sendai — Proyecto no oficial y sin fines de lucro.
        </p>
        <p className="text-xs">
          Este carnet digital no constituye membresía oficial del club Vegalta Sendai.
        </p>
        <p className="text-xs text-vegalta-gold/60">
          © {new Date().getFullYear()} Vegalta Sendai Hispano — Licencia MIT
        </p>
      </div>
    </footer>
  );
}
