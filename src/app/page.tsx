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
  const { data: initialMedia } = await supabase
    .from("user_media")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // 4. Renderiza apenas a DashboardClient.
  // O Header NÃO está aqui, ele já está no seu layout.tsx!
  return (
    <main className="w-full min-h-screen flex flex-col bg-zinc-950">
      <DashboardClient
        userEmail={user.email || ""}
        initialMedia={initialMedia || []}
      />
    </main>
  );
}
