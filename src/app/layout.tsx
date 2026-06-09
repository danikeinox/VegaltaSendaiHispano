import type { Metadata } from "next";
import {
  Hanken_Grotesk,
  Noto_Sans_JP,
  Plus_Jakarta_Sans,
} from "next/font/google";
import { AppwritePing } from "@/components/appwrite-ping";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
};

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  weight: ["600", "700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500"],
});

const notoJp = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-jp",
  weight: ["400", "500", "700"],
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
      className={`${hanken.variable} ${jakarta.variable} ${notoJp.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-sans antialiased">
        <AppwritePing />
        {children}
      </body>
    </html>
  );
}
