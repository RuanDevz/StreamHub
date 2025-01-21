export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Movie {
  id: string;
  title: string;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  tmdb_id: number | null;
  release_date: string | null;
  rating: number | null;
  trailer_url: string | null;
  torrent_url: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}