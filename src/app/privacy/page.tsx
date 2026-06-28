import { ShieldCheck, Lock, Eye, Database, Server } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Política de Privacidade | SyncWatch",
  description:
    "Entenda como recolhemos, utilizamos e protegemos os seus dados.",
};

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 pb-20">
      <main className="max-w-4xl mx-auto px-6 pt-12 md:pt-20">
        {/* Cabeçalho da Página */}
        <header className="mb-12 border-b border-zinc-800 pb-8">
          <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-2xl mb-6">
            <ShieldCheck className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Política de Privacidade
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed">
            No SyncWatch, levamos a sua privacidade a sério. Entenda de forma
            clara como recolhemos, utilizamos e protegemos os dados da sua
            estante virtual de filmes e séries.
          </p>
        </header>

        {/* Conteúdo Principal */}
        <div className="space-y-10">
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-4 mb-4">
              <Database className="w-6 h-6 text-emerald-400" />
              <h2 className="text-2xl font-semibold">
                1. Dados que Recolhemos
              </h2>
            </div>
            <p className="text-zinc-400 mb-4 leading-relaxed">
              Para proporcionar uma experiência personalizada e um
              acompanhamento exato do que está a ver, recolhemos e armazenamos
              os seguintes dados:
            </p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
              <li>
                <strong className="text-zinc-200">Informações de Conta:</strong>{" "}
                O seu endereço de e-mail e nome de utilizador, geridos de forma
                totalmente segura e encriptada.
              </li>
              <li>
                <strong className="text-zinc-200">A Sua Estante:</strong>{" "}
                Títulos adicionados, histórico de progresso (temporadas e
                episódios), classificações (notas) e as suas categorias
                personalizadas.
              </li>
              <li></li>
              <li>
                <strong className="text-zinc-200">
                  Preferências do Onboarding:
                </strong>{" "}
                Atores, atrizes e realizadores favoritos usados para calibrar o
                nosso algoritmo.
              </li>
            </ul>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-4 mb-4">
              <Server className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-semibold">
                2. Serviços de Terceiros e APIs
              </h2>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Para que o SyncWatch tenha capas dinâmicas e funcionalidades
              inteligentes, cruzamos dados de forma anónima com alguns serviços
              essenciais:
            </p>
            <div className="mt-4 space-y-4">
              <div className="bg-black/50 p-4 rounded-xl border border-zinc-800/50">
                <h3 className="font-medium text-zinc-200 mb-1">
                  The Movie Database (TMDB)
                </h3>
                <p className="text-sm text-zinc-400">
                  O nosso motor de pesquisa funciona ligado à API do TMDB.
                  Quando procura um título ou uma celebridade, o seu termo de
                  pesquisa é enviado para o catálogo deles para retornar a
                  imagem e os metadados (duração, género, etc.).
                </p>
              </div>
              <div className="bg-black/50 p-4 rounded-xl border border-zinc-800/50">
                <h3 className="font-medium text-zinc-200 mb-1">
                  Motor de Inteligência Artificial
                </h3>
                <p className="text-sm text-zinc-400">
                  Utilizamos um motor de inteligência artificial para oferecer
                  recomendações personalizadas com base nas suas preferências e
                  comportamento de visualização.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-4 mb-4">
              <Eye className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-semibold">
                3. O Seu Controlo sobre os Dados
              </h2>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              O SyncWatch foi desenhado para colocar o utilizador em total
              controlo. Na nossa plataforma, é-lhe garantido o direito de:
            </p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2 mt-4 ml-4">
              <li>
                Editar ou apagar o progresso de visualização sempre que desejar.
              </li>
              <li>
                Eliminar fisicamente da nossa base de dados qualquer filme ou
                série adicionados à sua estante através do ícone da lixeira.
              </li>
            </ul>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-4 mb-4">
              <Lock className="w-6 h-6 text-rose-400" />
              <h2 className="text-2xl font-semibold">
                4. Segurança e Privacidade
              </h2>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              A arquitetura do SyncWatch foi desenvolvida sob rigorosos padrões
              de segurança. A base de dados utiliza políticas de segurança a
              nível das linhas (
              <em className="text-zinc-300">Row Level Security</em>), o que
              significa que nenhum outro utilizador consegue ler, editar ou
              eliminar as entradas que pertencem ao seu perfil, mantendo o seu
              histórico de consumo de multimédia isolado e blindado.
            </p>
          </section>
        </div>

        {/* Rodapé com botão de voltar */}
        <div className="mt-16 flex justify-center">
          <Link href="/">
            <Button
              variant="secondary"
              className="px-8 py-6 rounded-full text-base font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-100 transition-all"
            >
              Voltar para a Aplicação
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
