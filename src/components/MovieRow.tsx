'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EnrichedMovie } from '@/types';
import MovieCard from './MovieCard';

interface MovieRowProps {
  title: string;
  movies: EnrichedMovie[];
  onMovieClick: (movie: EnrichedMovie) => void;
}

export default function MovieRow({ title, movies, onMovieClick }: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (movies.length === 0) return null;

  return (
    <div className="mb-8 group/row">
      <h2 className="text-lg md:text-xl font-bold text-white mb-3 px-4 md:px-12">
        {title}
        <span className="text-sm font-normal text-gray-400 ml-3">
          {movies.length} title{movies.length !== 1 ? 's' : ''}
        </span>
      </h2>

      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-20 w-10 md:w-12 bg-black/50 hover:bg-black/80 text-white opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div
          ref={scrollRef}
          className="scroll-row flex gap-2 md:gap-3 overflow-x-auto px-4 md:px-12 pb-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none' }}
        >
          {movies.map((movie) => (
            <MovieCard key={movie.tmdbId} movie={movie} onClick={onMovieClick} />
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-20 w-10 md:w-12 bg-black/50 hover:bg-black/80 text-white opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
