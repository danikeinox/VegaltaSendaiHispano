import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppwritePing } from "@/components/appwrite-ping";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Vegalta Sendai Hispano — Carnet Digital",
  description:
    "Comunidad hispana de fans del Vegalta Sendai. Obtén tu carnet digital gratuito para Apple Wallet y Google Wallet.",
  keywords: ["Vegalta Sendai", "fútbol japonés", "J-League", "comunidad hispana"],
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <AppwritePing />
        {children}
      </body>
    </html>
  );
}
