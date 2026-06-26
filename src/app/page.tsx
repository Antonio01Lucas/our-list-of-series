import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SeriesCard } from "@/components/SeriesCard";

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
        <header className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-6">
          <Logo />
          <div className="flex items-center gap-6">
            <span className="text-sm text-zinc-400 font-medium">
              {user.email}
            </span>
            <Link href="/series/new">
              <Button>Adicionar Série</Button>
            </Link>
          </div>
        </header>

        <main>
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Suas Séries</h2>
            <p className="text-zinc-400">
              Gerencie o que você está assistindo agora.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {series?.map((serie) => (
              <SeriesCard key={serie.id} serie={serie} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
