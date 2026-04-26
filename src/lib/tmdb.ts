const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export function getApiKey(): string {
  return process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
}

export function getPosterUrl(path: string | null, size: string = 'w500'): string {
  if (!path) return '/placeholder-poster.png';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getBackdropUrl(path: string | null, size: string = 'w1280'): string {
  if (!path) return '/placeholder-backdrop.png';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export async function fetchMovieDetails(tmdbId: number) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${apiKey}&append_to_response=credits,videos`
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchMovieBasic(tmdbId: number) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${apiKey}`
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function searchMovies(query: string) {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}

export function getYouTubeTrailerUrl(videos: { results: { key: string; site: string; type: string }[] } | undefined): string | null {
  if (!videos?.results) return null;

  const trailer = videos.results.find(
    (v) => v.site === 'YouTube' && v.type === 'Trailer'
  );

  if (trailer) return `https://www.youtube.com/embed/${trailer.key}`;

  const teaser = videos.results.find(
    (v) => v.site === 'YouTube' && v.type === 'Teaser'
  );

  if (teaser) return `https://www.youtube.com/embed/${teaser.key}`;

  const anyYouTube = videos.results.find((v) => v.site === 'YouTube');
  if (anyYouTube) return `https://www.youtube.com/embed/${anyYouTube.key}`;

  return null;
}
