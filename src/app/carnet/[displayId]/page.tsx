import { notFound } from "next/navigation";
import Link from "next/link";
import { FaApple, FaGoogle } from "react-icons/fa";
import { MembershipCard } from "@/components/membership-card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { findMemberByDisplayId } from "@/lib/members";
import { memberLookupSchema } from "@/lib/validations";

type PageProps = { params: Promise<{ displayId: string }> };

export default async function CarnetPage({ params }: PageProps) {
  const { displayId: rawId } = await params;

  let displayId: string;
  try {
    ({ displayId } = memberLookupSchema.parse({ displayId: rawId }));
  } catch {
    notFound();
  }

  const member = await findMemberByDisplayId(displayId);

  if (!member) {
    notFound();
  }

  const appleUrl = `/api/wallet/apple?displayId=${encodeURIComponent(member.displayId)}`;
  const googleApiUrl = `/api/wallet/google?displayId=${encodeURIComponent(member.displayId)}`;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-vegalta-blue via-[#0D2F55] to-vegalta-blue">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center gap-8">
        <h1 className="text-2xl font-bold text-vegalta-gold">Carnet Digital</h1>

        <MembershipCard
          displayId={member.displayId}
          firstName={member.firstName}
          lastName={member.lastName}
        />

        <div className="text-center text-white/60 text-sm space-y-1">
          {member.country && <p>País: {member.country}</p>}
          <p>
            Miembro desde:{" "}
            {new Date(member.createdAt).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href={appleUrl}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-vegalta-blue text-white border border-vegalta-gold/30 hover:bg-vegalta-blue-light px-6 text-sm font-semibold transition-colors"
          >
            <FaApple />
            Apple Wallet
          </a>
          <a
            href={googleApiUrl}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border-2 border-vegalta-gold text-vegalta-gold hover:bg-vegalta-gold/10 px-6 text-sm font-semibold transition-colors"
          >
            <FaGoogle />
            Google Wallet
          </a>
        </div>

        <Link href="/" className="text-vegalta-gold/70 hover:text-vegalta-gold text-sm">
          ← Volver al inicio
        </Link>
      </main>

      <Footer />
    </div>
  );
}
