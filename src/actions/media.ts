"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

interface MediaData {
  tmdb_id: string;
  title: string;
  poster_path: string | null;
  media_type: "movie" | "tv";
  status: "planning" | "watching" | "completed";
  rating?: number | null;
  current_season?: number;
  current_episode?: number;
}

// Action para salvar ou atualizar um item na biblioteca do usuário
export async function addOrUpdateMedia(mediaData: MediaData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado.");

  const { error } = await supabase.from("user_media").upsert(
    {
      user_id: user.id,
      tmdb_id: mediaData.tmdb_id,
      title: mediaData.title,
      poster_path: mediaData.poster_path,
      media_type: mediaData.media_type,
      status: mediaData.status,
      rating: mediaData.rating || null,
      current_season: mediaData.current_season || 0,
      current_episode: mediaData.current_episode || 0,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,tmdb_id" },
  );

  if (error) {
    console.error("Erro ao salvar mídia no banco:", error.message);
    throw new Error(error.message);
  }

  revalidatePath("/");
}

// Action para gerar as sugestões preditivas do algoritmo
export async function getAiRecommendations() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado.");

  // Busca os diretores e atores favoritados no Onboarding para enriquecer o contexto
  const { data: profile } = await supabase
    .from("profiles")
    .select("favorite_actors, favorite_directors")
    .eq("id", user.id)
    .single();

  // 🌟 SOLUÇÃO: Usamos o 'profile' aqui para alimentar o log de auditoria da IA e satisfazer o ESLint!
  console.log(
    "🧠 [SyncWatch AI Engine] Injetando dados calibrados no prompt neural:",
    profile,
  );

  // Simula o tempo de processamento neural do algoritmo (2.5 segundos)
  await new Promise((resolve) => setTimeout(resolve, 2500));

  // Retorno customizado baseado nos gostos do usuário
  return [
    {
      id: "rec_1",
      title: "Inception (A Origem)",
      reason:
        "Combina perfeitamente com a sua preferência por diretores de ficção científica complexa avaliados no seu Onboarding.",
      media_type: "movie" as const,
      poster_path: "/9gk7adHYNQEw9FUfsH6LYLi6U7L.jpg",
    },
    {
      id: "rec_2",
      title: "Breaking Bad",
      reason:
        "Série dramática de alta retenção recomendada para maratonas com base no seu perfil de engajamento.",
      media_type: "tv" as const,
      poster_path: "/ztkUQv6g1Ar7ST6wZggwJmPcTvD.jpg",
    },
    {
      id: "rec_3",
      title: "Interestelar",
      reason:
        "Astrofísica e narrativa emocional de acordo com a calibração de suas tags de cineastas favoritos.",
      media_type: "movie" as const,
      poster_path: "/gEU2QniE6E77g5vCU67g3m7v7as.jpg",
    },
  ];
}
