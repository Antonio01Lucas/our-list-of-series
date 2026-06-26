import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tmdbId = searchParams.get("tmdb_id");

  if (!tmdbId) {
    return NextResponse.json({ error: "ID do TMDB ausente" }, { status: 400 });
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Chave da API ausente" },
      { status: 500 },
    );
  }

  try {
    const isTokenV4 = apiKey.startsWith("eyJ");
    const url = isTokenV4
      ? `https://api.themoviedb.org/3/tv/${tmdbId}?language=pt-BR`
      : `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${apiKey}&language=pt-BR`;

    const headers: Record<string, string> = {};
    if (isTokenV4) headers["Authorization"] = `Bearer ${apiKey}`;

    const response = await fetch(url, { headers });
    if (!response.ok) {
      return NextResponse.json({ seasons: [] });
    }

    const data = await response.json();

    // Filtramos e mapeamos apenas o número da temporada e a quantidade de episódios dela
    const seasonsMap =
      data.seasons?.map(
        (s: { season_number: number; episode_count: number }) => ({
          season_number: s.season_number,
          episode_count: s.episode_count,
        }),
      ) || [];

    return NextResponse.json({ seasons: seasonsMap });
  } catch (error) {
    console.error("Erro ao buscar episódios por temporada:", error);
    return NextResponse.json({ seasons: [] }, { status: 500 });
  }
}
