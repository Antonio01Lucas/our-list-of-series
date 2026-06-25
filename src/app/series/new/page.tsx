import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { updateSeriesStatus } from "@/actions/series";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: series } = await supabase
    .from("series")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <header className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-6">
          <Logo />
          <div className="flex items-center gap-6">
            <span className="text-sm text-zinc-400 font-medium">
              {user.email}
            </span>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Suas Séries</h2>
              <p className="text-zinc-400">
                Gerencie o que você está assistindo agora.
              </p>
            </div>
          </div>

          {/* Grid de Séries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {series?.map((serie) => {
              // Lógica de atualização interna isolada
              const handleUpdate = async () => {
                "use server";
                const novoStatus =
                  serie.status === "assistindo" ? "finalizado" : "assistindo";
                await updateSeriesStatus(serie.id, novoStatus);
              };

              return (
                <div
                  key={serie.id}
                  className="group bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl hover:border-blue-500/50 transition-all hover:bg-zinc-900"
                >
                  <h3 className="font-bold text-lg mb-1 group-hover:text-blue-400 transition-colors">
                    {serie.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider mb-4">
                    {serie.status.replace("_", " ")}
                  </p>

                  <form action={handleUpdate}>
                    <button
                      type="submit"
                      className="text-xs bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-medium transition-colors w-full"
                    >
                      {serie.status === "assistindo" ? "Finalizar" : "Assistir"}
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
