import type { Metadata } from "next";
// 1. Alteramos a importação da fonte aqui:
import { Poppins } from "next/font/google";
import { Header } from "@/components/Header";
import { Providers } from "@/providers/providers";
import "@/app/globals.css";

// 2. Configuramos a nova fonte (Poppins)
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

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
      {/* 3. Aplicamos a classe 'poppins.className' no body */}
      <body
        className={`${poppins.className} bg-zinc-950 text-white antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
