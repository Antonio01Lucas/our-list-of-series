// app/termos/page.tsx
import Link from "next/link";

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          Termos de Serviço
        </h1>

        <section className="space-y-4 text-gray-700">
          <p>
            <strong>Última atualização:</strong> 28 de junho de 2026
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6">
            1. Finalidade do Aplicativo
          </h2>
          <p>
            O <em>our-list-of-series</em> é uma ferramenta de organização
            pessoal para amantes de séries, permitindo o gerenciamento de listas
            de acompanhamento.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6">
            2. Autenticação
          </h2>
          <p>
            O acesso é restrito e gerenciado via Google OAuth para garantir a
            segurança dos seus dados e listas pessoais.
          </p>
        </section>

        <footer className="mt-10 pt-6 border-t">
          <Link href="/" className="text-blue-600 hover:underline font-medium">
            ← Voltar para a página inicial
          </Link>
        </footer>
      </div>
    </main>
  );
}
