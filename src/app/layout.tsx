import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google"; // Carregando a nova fonte
import "./globals.css";
import { Providers } from "@/components/providers";

// Configurando a fonte
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "SyncWatch",
  description: "Sua plataforma de filmes e séries",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${plusJakartaSans.className} bg-zinc-950 text-white antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
