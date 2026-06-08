import { RegistrationForm } from "@/components/registration-form";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-vegalta-blue via-[#0D2F55] to-vegalta-blue">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Hero */}
        <section className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-block mb-4 px-4 py-1 rounded-full border border-vegalta-gold/40 bg-vegalta-gold/10 text-vegalta-gold text-xs font-semibold tracking-widest uppercase">
            Comunidad Hispana · No oficial
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
            Tu carnet digital de{" "}
            <span className="text-vegalta-gold">Vegalta Sendai</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Regístrate gratis y obtén tu carnet de socio de la comunidad hispana.
            Intégralo directamente en Apple Wallet o Google Wallet.
          </p>
        </section>

        {/* Features */}
        <section className="grid sm:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
          {[
            {
              title: "ID único consecutivo",
              desc: "Cada socio recibe un identificador VS-0001, VS-0002... asignado de forma segura.",
            },
            {
              title: "Apple & Google Wallet",
              desc: "Añade tu carnet a la cartera de tu móvil con un solo toque.",
            },
            {
              title: "100% gratuito",
              desc: "Proyecto open-source sin fines de lucro para la comunidad hispana.",
            },
          ].map((feature) => (
            <Card key={feature.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Registration */}
        <section id="registro" className="flex flex-col items-center">
          <h2 className="text-2xl font-bold text-vegalta-gold mb-8">
            Registro gratuito
          </h2>
          <RegistrationForm />
        </section>
      </main>

      <Footer />
    </div>
  );
}
