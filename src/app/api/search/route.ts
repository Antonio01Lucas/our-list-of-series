import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const type = searchParams.get("type") || "multi"; // 'movie' ou 'tv'

  if (!query) return NextResponse.json({ results: [] });

  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } }); // Cache ISR de 1 hora
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Detalhes do erro do TMDB:", error);
    return NextResponse.json(
      { error: "Erro ao buscar no TMDB" },
      { status: 500 },
    );
  }
}
