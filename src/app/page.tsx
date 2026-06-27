import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Verificação de Autenticação no lado do servidor
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Valida se o usuário concluiu as etapas de onboarding
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single();

  // Se não completou o onboarding, redireciona para lá
  if (profile && !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  // 3. Busca a biblioteca de mídias do usuário para popular a estante
  const { data: initialMedia, error } = await supabase
    .from("series")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar dados:", error);
  }

  // 🌟 OS CONSOLES DEVEM FICAR AQUI, DENTRO DA FUNÇÃO E ANTES DO RETURN 🌟
  console.log("DEBUG: User ID buscando:", user.id);
  console.log("DEBUG: Dados encontrados:", initialMedia);

  // 4. Renderiza apenas a DashboardClient.
  return (
    <main className="w-full min-h-screen flex flex-col bg-zinc-950">
      <DashboardClient
        userEmail={user.email || ""}
        initialMedia={initialMedia || []}
      />
    </main>
  );
}
