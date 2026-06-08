import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_JP, Oswald, Bebas_Neue } from "next/font/google";
import { AppwritePing } from "@/components/appwrite-ping";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
};

const noto = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto",
});

const notoJp = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-jp",
  weight: ["400", "500", "700"],
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["400", "500", "600", "700"],
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-bebas",
  weight: "400",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${noto.variable} ${notoJp.variable} ${oswald.variable} ${bebas.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-sans antialiased">
        <AppwritePing />
        {children}
      </body>
    </html>
  );
}
