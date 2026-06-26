// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers"; // Importando o Provider

export const metadata: Metadata = {
  title: "SyncWatch", // Ajuste para o nome do seu projeto
  description: "Sua plataforma de filmes e séries",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {/* O Providers envolve todo o conteúdo do seu app */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
