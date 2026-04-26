'use client';

import { useEffect, useState, useMemo } from 'react';
import { Disc3, Filter } from 'lucide-react';
import { EnrichedMovie, CollectionItem, TMDBMovie, MovieCategory, MediaFormat } from '@/types';
import { fetchMovieBasic, getBackdropUrl } from '@/lib/tmdb';
import collectionData from '@/data/collection.json';
import Navbar from '@/components/Navbar';
import MovieRow from '@/components/MovieRow';
import MovieModal from '@/components/MovieModal';

const COLLECTION = collectionData as CollectionItem[];

type FilterType = 'all' | 'available' | 'checked-out' | '4K UHD' | 'Blu-ray' | 'DVD' | 'VHS';

export default function HomePage() {
  const [movies, setMovies] = useState<EnrichedMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<EnrichedMovie | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [heroMovie, setHeroMovie] = useState<EnrichedMovie | null>(null);

  useEffect(() => {
    async function loadCollection() {
      setLoading(true);
      const enriched: EnrichedMovie[] = await Promise.all(
        COLLECTION.map(async (item) => {
          const tmdbData: TMDBMovie | null = await fetchMovieBasic(item.tmdbId);
          return { ...item, tmdbData: tmdbData || undefined };
        })
      );
      setMovies(enriched);

      const available = enriched.filter((m) => m.status === 'available' && m.tmdbData?.backdrop_path);
      if (available.length > 0) {
        setHeroMovie(available[Math.floor(Math.random() * available.length)]);
      }

      setLoading(false);
    }
    loadCollection();
  }, []);

  const filteredMovies = useMemo(() => {
    let result = movies;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.genre?.some((g) => g.toLowerCase().includes(q)) ||
          m.tags?.some((t) => t.toLowerCase().includes(q)) ||
          m.location?.toLowerCase().includes(q) ||
          m.checkedOutBy?.toLowerCase().includes(q) ||
          m.formats.some((f) => f.toLowerCase().includes(q))
      );
    }

    if (activeFilter === 'available') {
      result = result.filter((m) => m.status === 'available');
    } else if (activeFilter === 'checked-out') {
      result = result.filter((m) => m.status !== 'available');
    } else if (['4K UHD', 'Blu-ray', 'DVD', 'VHS'].includes(activeFilter)) {
      result = result.filter((m) => m.formats.includes(activeFilter as MediaFormat));
    }

    return result;
  }, [movies, searchQuery, activeFilter]);

  const categories: MovieCategory[] = useMemo(() => {
    if (searchQuery.trim()) {
      return [{ title: `Search Results for "${searchQuery}"`, movies: filteredMovies }];
    }

    const cats: MovieCategory[] = [];

    const recentlyAdded = [...filteredMovies]
      .sort((a, b) => (b.dateAdded || '').localeCompare(a.dateAdded || ''))
      .slice(0, 15);
    if (recentlyAdded.length > 0) {
      cats.push({ title: 'Recently Added', movies: recentlyAdded });
    }

    const favorites = filteredMovies.filter((m) => m.tags?.includes('favorites'));
    if (favorites.length > 0) {
      cats.push({ title: 'Family Favorites', movies: favorites });
    }

    const fourK = filteredMovies.filter((m) => m.formats.includes('4K UHD'));
    if (fourK.length > 0) {
      cats.push({ title: '4K Ultra HD Collection', movies: fourK });
    }

    const genres = new Map<string, EnrichedMovie[]>();
    filteredMovies.forEach((m) => {
      m.genre?.forEach((g) => {
        if (!genres.has(g)) genres.set(g, []);
        genres.get(g)!.push(m);
      });
    });

    const sortedGenres = [...genres.entries()].sort((a, b) => b[1].length - a[1].length);
    sortedGenres.forEach(([genre, genreMovies]) => {
      if (genreMovies.length >= 2) {
        cats.push({ title: genre, movies: genreMovies });
      }
    });

    const unavailable = filteredMovies.filter((m) => m.status !== 'available');
    if (unavailable.length > 0) {
      cats.push({ title: 'Currently Checked Out', movies: unavailable });
    }

    const locations = new Map<string, EnrichedMovie[]>();
    filteredMovies.forEach((m) => {
      if (m.location) {
        if (!locations.has(m.location)) locations.set(m.location, []);
        locations.get(m.location)!.push(m);
      }
    });

    locations.forEach((locMovies, location) => {
      if (locMovies.length >= 2) {
        cats.push({ title: `📍 ${location}`, movies: locMovies });
      }
    });

    return cats;
  }, [filteredMovies, searchQuery]);

  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Available', value: 'available' },
    { label: 'Checked Out', value: 'checked-out' },
    { label: '4K UHD', value: '4K UHD' },
    { label: 'Blu-ray', value: 'Blu-ray' },
    { label: 'DVD', value: 'DVD' },
    { label: 'VHS', value: 'VHS' },
  ];

  return (
    <main className="min-h-screen bg-edflix-dark">
      <Navbar onSearch={setSearchQuery} searchQuery={searchQuery} />

      {/* Hero section */}
      {!searchQuery && heroMovie && heroMovie.tmdbData?.backdrop_path && (
        <div className="relative h-[60vh] md:h-[70vh]">
          <img
            src={getBackdropUrl(heroMovie.tmdbData.backdrop_path, 'original')}
            alt={heroMovie.title}
            className="w-full h-full object-cover"
          />
          <div className="hero-gradient absolute inset-0" />
          <div className="absolute bottom-16 left-4 md:left-12 max-w-xl z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
              {heroMovie.title}
            </h2>
            <p className="text-sm text-gray-200 line-clamp-3 mb-3 drop-shadow">
              {heroMovie.tmdbData?.overview}
            </p>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {heroMovie.formats.map((f) => (
                <span
                  key={f}
                  className="text-xs bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded"
                >
                  {f}
                </span>
              ))}
            </div>
            <button
              onClick={() => setSelectedMovie(heroMovie)}
              className="bg-white text-black font-semibold px-6 py-2.5 rounded hover:bg-gray-200 transition-colors text-sm"
            >
              More Info
            </button>
          </div>
        </div>
      )}

      {/* Collection stats bar */}
      <div className={`px-4 md:px-12 ${!searchQuery && heroMovie ? '-mt-4' : 'pt-24'} pb-4 relative z-10`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <Disc3 className="w-4 h-4 text-edflix-red" />
            <span>
              <strong className="text-white">{movies.length}</strong> titles in collection
            </span>
            <span className="text-gray-600">|</span>
            <span>
              <strong className="text-green-400">
                {movies.filter((m) => m.status === 'available').length}
              </strong>{' '}
              available
            </span>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-500" />
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                  activeFilter === f.value
                    ? 'bg-white text-black font-semibold'
                    : 'bg-edflix-light-gray text-gray-300 hover:bg-gray-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-edflix-red border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading your collection...</p>
          </div>
        </div>
      )}

      {/* No API key warning */}
      {!loading && movies.length > 0 && !movies[0].tmdbData && (
        <div className="mx-4 md:mx-12 mb-6 bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
          <p className="text-yellow-300 text-sm font-semibold mb-1">TMDB API Key Missing</p>
          <p className="text-yellow-200/70 text-sm">
            Create a <code className="bg-black/30 px-1.5 py-0.5 rounded">.env.local</code> file with{' '}
            <code className="bg-black/30 px-1.5 py-0.5 rounded">NEXT_PUBLIC_TMDB_API_KEY=your_key_here</code>{' '}
            to load movie posters, info, and trailers. Get a free key at{' '}
            <a
              href="https://www.themoviedb.org/settings/api"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-yellow-300 hover:text-yellow-100"
            >
              themoviedb.org
            </a>
          </p>
        </div>
      )}

      {/* No results */}
      {!loading && filteredMovies.length === 0 && (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-2">No movies found</p>
            <p className="text-gray-600 text-sm">Try a different search or filter</p>
          </div>
        </div>
      )}

      {/* Movie rows */}
      <div className="pb-12">
        {categories.map((cat) => (
          <MovieRow
            key={cat.title}
            title={cat.title}
            movies={cat.movies}
            onMovieClick={setSelectedMovie}
          />
        ))}
      </div>

      {/* Movie detail modal */}
      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </main>
  );
}
