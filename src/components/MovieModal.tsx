'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Star, Clock, MapPin, Calendar, CheckCircle, AlertCircle, Users, Disc3 } from 'lucide-react';
import { EnrichedMovie, TMDBMovieDetail } from '@/types';
import { fetchMovieDetails, getBackdropUrl, getPosterUrl, getYouTubeTrailerUrl } from '@/lib/tmdb';
import MediaBadge from './MediaBadge';

interface MovieModalProps {
  movie: EnrichedMovie | null;
  onClose: () => void;
}

export default function MovieModal({ movie, onClose }: MovieModalProps) {
  const [details, setDetails] = useState<TMDBMovieDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!movie) return;
    setLoading(true);
    fetchMovieDetails(movie.tmdbId).then((data) => {
      setDetails(data);
      setLoading(false);
    });
  }, [movie]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  if (!movie) return null;

  const trailerUrl = details ? getYouTubeTrailerUrl(details.videos) : null;
  const backdropUrl = getBackdropUrl(details?.backdrop_path || movie.tmdbData?.backdrop_path || null);
  const posterUrl = getPosterUrl(details?.poster_path || movie.tmdbData?.poster_path || null);
  const year = (details?.release_date || movie.tmdbData?.release_date)?.split('-')[0] || '';
  const rating = details?.vote_average || movie.tmdbData?.vote_average;
  const runtime = details?.runtime;
  const director = details?.credits?.crew?.find((c) => c.job === 'Director');
  const cast = details?.credits?.cast?.slice(0, 8) || [];

  const statusConfig = {
    available: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Available' },
    'checked-out': {
      icon: Users,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      label: `Checked out by ${movie.checkedOutBy || 'someone'}`,
    },
    'lent-out': {
      icon: AlertCircle,
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      label: `Lent to ${movie.checkedOutBy || 'someone'}`,
    },
  };

  const status = statusConfig[movie.status];
  const StatusIcon = status.icon;

  return (
    <div
      className="modal-overlay fixed inset-0 z-[100] bg-black/80 flex items-start justify-center overflow-y-auto py-8 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content relative bg-edflix-gray rounded-lg overflow-hidden max-w-3xl w-full shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 bg-edflix-dark/80 hover:bg-edflix-dark rounded-full p-2 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Backdrop / Trailer */}
        <div className="relative aspect-video bg-black">
          {trailerUrl ? (
            <iframe
              src={`${trailerUrl}?autoplay=1&mute=1&rel=0`}
              title="Trailer"
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : backdropUrl && details?.backdrop_path ? (
            <img
              src={backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No trailer available
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-edflix-gray to-transparent" />
        </div>

        {/* Content */}
        <div className="px-6 md:px-10 pb-8 -mt-8 relative z-10">
          <div className="flex gap-6">
            {/* Poster (mobile hidden) */}
            <div className="hidden md:block flex-shrink-0 w-36 -mt-24 relative z-20">
              {details?.poster_path || movie.tmdbData?.poster_path ? (
                <img
                  src={posterUrl}
                  alt={movie.title}
                  className="w-full rounded-lg shadow-xl"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-edflix-light-gray rounded-lg flex items-center justify-center text-gray-500 text-sm">
                  No poster
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                {movie.title}
              </h2>

              {details?.tagline && (
                <p className="text-gray-400 italic text-sm mb-3">&ldquo;{details.tagline}&rdquo;</p>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300 mb-4">
                {year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {year}
                  </span>
                )}
                {rating && (
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-3.5 h-3.5 fill-yellow-400" /> {rating.toFixed(1)}
                  </span>
                )}
                {runtime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {Math.floor(runtime / 60)}h {runtime % 60}m
                  </span>
                )}
              </div>

              {/* Physical media section */}
              <div className="bg-edflix-dark rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Disc3 className="w-4 h-4 text-edflix-red" />
                  <span className="text-sm font-semibold text-white">Physical Media</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {movie.formats.map((f) => (
                    <MediaBadge key={f} format={f} size="md" />
                  ))}
                </div>

                <div className={`flex items-center gap-2 ${status.bg} ${status.color} rounded px-3 py-2 text-sm`}>
                  <StatusIcon className="w-4 h-4" />
                  <span>{status.label}</span>
                </div>

                {movie.location && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm mt-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{movie.location}</span>
                  </div>
                )}

                {movie.notes && (
                  <p className="text-gray-400 text-sm mt-2 italic">{movie.notes}</p>
                )}
              </div>

              {/* Overview */}
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-edflix-light-gray rounded animate-pulse w-full" />
                  <div className="h-4 bg-edflix-light-gray rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-edflix-light-gray rounded animate-pulse w-5/6" />
                </div>
              ) : (
                <>
                  {details?.overview && (
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                      {details.overview}
                    </p>
                  )}

                  {/* Genres */}
                  {details?.genres && details.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {details.genres.map((g) => (
                        <span
                          key={g.id}
                          className="text-xs bg-edflix-light-gray text-gray-300 px-2.5 py-1 rounded-full"
                        >
                          {g.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Director */}
                  {director && (
                    <p className="text-sm text-gray-400 mb-2">
                      <span className="text-gray-500">Directed by</span>{' '}
                      <span className="text-white">{director.name}</span>
                    </p>
                  )}

                  {/* Cast */}
                  {cast.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-500 mb-1">Cast</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                        {cast.map((c) => (
                          <span key={c.id} className="text-gray-300">
                            {c.name}
                            <span className="text-gray-600 ml-1 text-xs">as {c.character}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
