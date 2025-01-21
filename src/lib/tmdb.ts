import axios from 'axios';

// Constantes
const TMDB_API_KEY = '98acb4c551844c564ac58eeb4ef47728'; // Sua chave de API do TMDb
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Interfaces para tipagem
interface TMDbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids?: number[]; // Adicionado para suportar gêneros
}

interface TMDbVideoResult {
  key: string;
  site: string;
  type: string;
}

interface TMDbGenre {
  id: number;
  name: string;
}

interface Movie {
  id: string;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  rating: number;
  category: string;
  tmdb_id: number;
  trailer_url: string | null;
  torrent_url: string | null;
  created_at: string;
  updated_at: string;
}

// Configuração global do Axios
const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'pt-BR',
  },
});

// Funções da API
export const tmdb = {
  /**
   * Busca filmes populares com suporte a paginação.
   */
  async getPopularMovies(page: number = 1): Promise<TMDbMovie[]> {
    try {
      const response = await tmdbClient.get('/movie/popular', {
        params: { page },
      });

      if (!response.data || !response.data.results) {
        throw new Error('Dados inválidos retornados pela API');
      }

      return response.data.results;
    } catch (error) {
      console.error('Erro ao buscar filmes populares:', error);
      throw error;
    }
  },

  /**
   * Busca detalhes de um filme pelo ID.
   */
  async getMovieDetails(movieId: number): Promise<TMDbMovie> {
    try {
      const response = await tmdbClient.get(`/movie/${movieId}`);

      if (!response.data) {
        throw new Error('Filme não encontrado');
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar detalhes do filme:', error);
      throw error;
    }
  },

  /**
   * Busca vídeos (trailers, teasers) de um filme pelo ID.
   */
  async getMovieVideos(movieId: number): Promise<TMDbVideoResult[]> {
    try {
      const response = await tmdbClient.get(`/movie/${movieId}/videos`);

      if (!response.data || !response.data.results) {
        throw new Error('Nenhum vídeo encontrado');
      }

      return response.data.results;
    } catch (error) {
      console.error('Erro ao buscar vídeos do filme:', error);
      throw error;
    }
  },

  /**
   * Pesquisa filmes por uma query.
   */
  async searchMovies(query: string, page: number = 1): Promise<TMDbMovie[]> {
    try {
      const response = await tmdbClient.get('/search/movie', {
        params: { query, page },
      });

      if (!response.data || !response.data.results) {
        throw new Error('Nenhum filme encontrado');
      }

      return response.data.results;
    } catch (error) {
      console.error('Erro ao pesquisar filmes:', error);
      throw error;
    }
  },

  /**
   * Busca filmes por gênero.
   */
  async getMoviesByGenre(genreId: number, page: number = 1): Promise<TMDbMovie[]> {
    try {
      const response = await tmdbClient.get('/discover/movie', {
        params: { with_genres: genreId, page },
      });

      if (!response.data || !response.data.results) {
        throw new Error('Nenhum filme encontrado para o gênero especificado');
      }

      return response.data.results;
    } catch (error) {
      console.error('Erro ao buscar filmes por gênero:', error);
      throw error;
    }
  },

  /**
   * Busca a lista de gêneros de filmes.
   */
  async getGenres(): Promise<TMDbGenre[]> {
    try {
      const response = await tmdbClient.get('/genre/movie/list');

      if (!response.data || !response.data.genres) {
        throw new Error('Nenhum gênero encontrado');
      }

      return response.data.genres;
    } catch (error) {
      console.error('Erro ao buscar gêneros:', error);
      throw error;
    }
  },

  /**
   * Converte um filme do TMDb para o formato interno.
   */
  convertToMovie(tmdbMovie: TMDbMovie): Movie {
    return {
      id: tmdbMovie.id.toString(),
      title: tmdbMovie.title,
      overview: tmdbMovie.overview,
      poster_path: tmdbMovie.poster_path
        ? `${TMDB_IMAGE_BASE_URL}/w500${tmdbMovie.poster_path}`
        : null,
      backdrop_path: tmdbMovie.backdrop_path
        ? `${TMDB_IMAGE_BASE_URL}/original${tmdbMovie.backdrop_path}`
        : null,
      release_date: tmdbMovie.release_date,
      rating: Math.round(tmdbMovie.vote_average * 10) / 10,
      category: 'movie', // Categoria padrão
      tmdb_id: tmdbMovie.id,
      trailer_url: null, // Será definido separadamente
      torrent_url: null, // Será definido separadamente
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  /**
   * Obtém a URL do trailer do YouTube a partir dos vídeos.
   */
  getTrailerUrl(videos: TMDbVideoResult[]): string | null {
    const trailer = videos.find(
      (video) => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
    );
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
  },
};