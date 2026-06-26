import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Captura a sessão com total segurança no servidor
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

  if (profile && !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  // 3. Captura a biblioteca de mídias salva do usuário para a estante inicial
  const { data: initialMedia } = await supabase
    .from("user_media")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // 4. Renderiza a casca passando a reatividade para o cliente
  return (
    <main className="w-full min-h-[calc(100vh-64px)] flex flex-col">
      <DashboardClient
        userEmail={user.email || ""}
        initialMedia={initialMedia || []}
      />
    </main>
  );
}
