'use client';

import { EnrichedMovie } from '@/types';
import { getPosterUrl } from '@/lib/tmdb';
import MediaBadge from './MediaBadge';
import { MapPin, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface MovieCardProps {
  movie: EnrichedMovie;
  onClick: (movie: EnrichedMovie) => void;
}

export default function MovieCard({ movie, onClick }: MovieCardProps) {
  const posterUrl = getPosterUrl(movie.tmdbData?.poster_path || null);
  const year = movie.tmdbData?.release_date?.split('-')[0] || '';
  const rating = movie.tmdbData?.vote_average
    ? movie.tmdbData.vote_average.toFixed(1)
    : null;

  const statusConfig = {
    available: { icon: CheckCircle, color: 'text-green-400', label: 'Available' },
    'checked-out': { icon: Clock, color: 'text-yellow-400', label: `With ${movie.checkedOutBy || '?'}` },
    'lent-out': { icon: AlertCircle, color: 'text-red-400', label: `Lent to ${movie.checkedOutBy || '?'}` },
  };

  const status = statusConfig[movie.status];
  const StatusIcon = status.icon;

  return (
    <button
      onClick={() => onClick(movie)}
      className="movie-card flex-shrink-0 w-[160px] md:w-[200px] group cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-edflix-red rounded-md"
    >
      <div className="relative rounded-md overflow-hidden bg-edflix-gray aspect-[2/3]">
        {movie.tmdbData?.poster_path ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm px-2 text-center">
            {movie.title}
          </div>
        )}

        {/* Status indicator */}
        {movie.status !== 'available' && (
          <div className="absolute top-2 right-2 bg-black/80 rounded-full p-1">
            <StatusIcon className={`w-4 h-4 ${status.color}`} />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            {movie.formats.map((f) => (
              <MediaBadge key={f} format={f} />
            ))}
          </div>
          <p className="text-white text-xs font-semibold truncate">{movie.title}</p>
          <div className="flex items-center gap-2 text-[10px] text-gray-300 mt-0.5">
            {year && <span>{year}</span>}
            {rating && (
              <span className="flex items-center gap-0.5">
                <span className="text-yellow-400">&#9733;</span> {rating}
              </span>
            )}
          </div>
          <div className={`flex items-center gap-1 mt-1 text-[10px] ${status.color}`}>
            <StatusIcon className="w-3 h-3" />
            <span>{status.label}</span>
          </div>
          {movie.location && (
            <div className="flex items-center gap-1 mt-0.5 text-[10px] text-gray-400">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{movie.location}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
