"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// interface adaptada aos nomes exatos da tabela "series"
interface MediaData {
  tmdb_id: number; // Alterado para number pois a DB usa bigint
  title: string;
  poster_path: string | null;
  media_type: "movie" | "tv"; // Baseado no default 'tv' do esquema
  status: string; // 'plan to watch', 'watching', 'completed' ou custom
  rating?: number | null;
  current_season?: number;
  current_episode?: number;
}

export async function addOrUpdateMedia(mediaData: MediaData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Utilizador não autenticado.");

  // 1. Busca na tabela "series"
  const { data: existingItems, error: selectError } = await supabase
    .from("series")
    .select("id")
    .eq("user_id", user.id)
    .eq("tmdb_id", mediaData.tmdb_id)
    .limit(1);

  if (selectError) throw selectError;

  // 2. Lógica de Insert ou Update
  if (existingItems && existingItems.length > 0) {
    const { error } = await supabase
      .from("series")
      .update({
        title: mediaData.title,
        poster_path: mediaData.poster_path,
        media_type: mediaData.media_type,
        status: mediaData.status,
        rating: mediaData.rating || null,
        current_season: mediaData.current_season || 1,
        current_episode: mediaData.current_episode || 1,
      })
      .eq("user_id", user.id)
      .eq("tmdb_id", mediaData.tmdb_id);

    if (error) throw error;
  } else {
    const { error } = await supabase.from("series").insert({
      user_id: user.id,
      tmdb_id: mediaData.tmdb_id,
      title: mediaData.title,
      poster_path: mediaData.poster_path,
      media_type: mediaData.media_type,
      status: mediaData.status,
      rating: mediaData.rating || null,
      current_season: mediaData.current_season || 1,
      current_episode: mediaData.current_episode || 1,
    });

    if (error) throw error;
  }

  revalidatePath("/");
}

// Action para gerar as sugestões preditivas da IA
export async function getAiRecommendations() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Utilizador não autenticado.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("favorite_actors, favorite_directors")
    .eq("id", user.id)
    .single();

  console.log("🧠 [SyncWatch AI Engine] Processando perfil:", profile);

  // Simula o tempo de processamento
  await new Promise((resolve) => setTimeout(resolve, 2500));

  return [
    {
      id: "rec_1",
      title: "Inception (A Origem)",
      reason:
        "Combina perfeitamente com a tua preferência por diretores de ficção científica complexa avaliados no Onboarding.",
      media_type: "movie" as const,
      poster_path: "/9gk7adHYNQEw9FUfsH6LYLi6U7L.jpg",
    },
    {
      id: "rec_2",
      title: "Breaking Bad",
      reason:
        "Série dramática de alta retenção recomendada para maratonas com base no teu perfil de engajamento.",
      media_type: "tv" as const,
      poster_path: "/ztkUQv6g1Ar7ST6wZggwJmPcTvD.jpg",
    },
    {
      id: "rec_3",
      title: "Interestelar",
      reason:
        "Astrofísica e narrativa emocional de acordo com a calibração das tuas tags de cineastas favoritos.",
      media_type: "movie" as const,
      poster_path: "/gEU2QniE6E77g5vCU67g3m7v7as.jpg",
    },
  ];
}
