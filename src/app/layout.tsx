import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/Header";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SyncWatch",
  description: "Monitore suas maratonas de cinema",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${inter.className} bg-zinc-950 text-white antialiased min-h-screen flex flex-col`}
      >
        {/* Renderização do Header no topo */}
        <Header />

        {/* 🌟 VITORIA DE LAYOUT: O contêiner principal ganha flex-1 e pt-16 apenas se necessário, 
            mas para simplificar e não quebrar o login, as páginas ganham o espaçamento perfeitamente */}
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
