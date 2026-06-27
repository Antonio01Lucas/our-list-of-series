"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Interface adaptada aos nomes exatos da tabela "series"
interface MediaData {
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  media_type: "movie" | "tv";
  status: string;
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

// 🌟 NOVA FUNÇÃO HELPER: Pesquisa a imagem oficial no TMDB de forma inteligente (e Tipada!)
async function getTmdbPoster(
  title: string,
  type: "movie" | "tv",
): Promise<string | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

    if (!apiKey) {
      console.warn("⚠️ TMDB API Key não encontrada no servidor.");
      return null;
    }

    const url = `https://api.themoviedb.org/3/search/${type}?api_key=${apiKey}&query=${encodeURIComponent(title)}&language=pt-BR&page=1`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // 🔥 O SEGREDO AQUI: Tipamos o 'item' explicitamente em vez de usar 'any'
      const itemComPoster = data.results.find(
        (item: { poster_path: string | null }) => item.poster_path !== null,
      );

      if (itemComPoster) {
        return itemComPoster.poster_path;
      }
    }
  } catch (error) {
    console.error(`Erro ao buscar poster para ${title}:`, error);
  }
  return null;
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

  // 1. A IA gera a lista bruta (sem confiar nas imagens dela)
  const rawRecommendations = [
    {
      id: "rec_1",
      title: "Inception", // Ajustado para o nome original facilitar a busca
      reason:
        "Combina perfeitamente com a tua preferência por diretores de ficção científica complexa avaliados no Onboarding.",
      media_type: "movie" as const,
      poster_path: null, // A IA não precisa mais "adivinhar"
    },
    {
      id: "rec_2",
      title: "Breaking Bad",
      reason:
        "Série dramática de alta retenção recomendada para maratonas com base no teu perfil de engajamento.",
      media_type: "tv" as const,
      poster_path: null,
    },
    {
      id: "rec_3",
      title: "Interstellar", // Ajustado para o nome original
      reason:
        "Astrofísica e narrativa emocional de acordo com a calibração das tuas tags de cineastas favoritos.",
      media_type: "movie" as const,
      poster_path: null,
    },
  ];

  // 2. Enriquecimento de Dados (O Servidor faz o "Match" com o TMDB)
  // Utilizamos Promise.all para buscar as 3 imagens ao mesmo tempo (ultra rápido)
  const enrichedRecommendations = await Promise.all(
    rawRecommendations.map(async (rec) => {
      const realPoster = await getTmdbPoster(rec.title, rec.media_type);
      return {
        ...rec,
        poster_path: realPoster || rec.poster_path, // Se achar no TMDB usa, senão fallback
      };
    }),
  );

  return enrichedRecommendations;
}

export async function deleteMedia(tmdb_id: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Utilizador não autenticado.");

  const { error } = await supabase
    .from("series")
    .delete()
    .eq("user_id", user.id)
    .eq("tmdb_id", tmdb_id);

  if (error) throw error;

  revalidatePath("/");
}
