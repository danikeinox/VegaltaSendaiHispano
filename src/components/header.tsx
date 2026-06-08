import Link from "next/link";

export function Header() {
  return (
    <header className="w-full border-b border-vegalta-gold/20 bg-vegalta-blue/90 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-vegalta-gold/20 border-2 border-vegalta-gold flex items-center justify-center">
            <span className="text-vegalta-gold font-black text-sm">VS</span>
          </div>
          <div>
            <p className="font-bold text-vegalta-gold text-sm tracking-wider">
              VEGALTA SENDAI
            </p>
            <p className="text-white/60 text-xs">Comunidad Hispana</p>
          </div>
        </Link>
        <nav className="hidden sm:flex gap-6 text-sm text-white/80">
          <Link href="/" className="hover:text-vegalta-gold transition-colors">
            Inicio
          </Link>
          <Link href="/#registro" className="hover:text-vegalta-gold transition-colors">
            Registro
          </Link>
        </nav>
      </div>
    </header>
  );
}
