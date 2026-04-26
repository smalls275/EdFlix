export type MediaFormat = '4K UHD' | 'Blu-ray' | 'DVD' | 'VHS' | 'Steelbook' | 'LaserDisc' | 'HD DVD';

export type AvailabilityStatus = 'available' | 'checked-out' | 'lent-out';

export interface CollectionItem {
  tmdbId: number;
  title: string;
  formats: MediaFormat[];
  location?: string;
  status: AvailabilityStatus;
  checkedOutBy?: string;
  notes?: string;
  dateAdded?: string;
  genre?: string[];
  tags?: string[];
}

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  runtime?: number;
  genres?: { id: number; name: string }[];
  tagline?: string;
}

export interface TMDBMovieDetail extends TMDBMovie {
  runtime: number;
  genres: { id: number; name: string }[];
  tagline: string;
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
    crew: {
      id: number;
      name: string;
      job: string;
    }[];
  };
  videos?: {
    results: {
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
    }[];
  };
}

export interface EnrichedMovie extends CollectionItem {
  tmdbData?: TMDBMovie;
}

export interface MovieCategory {
  title: string;
  movies: EnrichedMovie[];
}
