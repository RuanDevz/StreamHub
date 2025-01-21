import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Download, Play } from 'lucide-react';

// Constantes da API do TMDb
const TMDB_API_KEY = '98acb4c551844c564ac58eeb4ef47728'; // Sua chave de API do TMDb
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Interface para tipagem dos dados do filme
interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genres: { id: number; name: string }[];
  videos?: {
    results: {
      key: string;
      site: string;
      type: string;
    }[];
  };
}

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = React.useState<Movie | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (id) {
      fetchMovie(id);
    }
  }, [id]);

  // Função para buscar detalhes do filme e vídeos
  async function fetchMovie(movieId: string) {
    try {
      // Buscar detalhes do filme
      const movieResponse = await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=pt-BR`
      );
      const movieData = await movieResponse.json();

      // Buscar vídeos do filme (trailers)
      const videosResponse = await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=pt-BR`
      );
      const videosData = await videosResponse.json();

      // Combinar os dados do filme e vídeos
      setMovie({
        ...movieData,
        videos: videosData,
      });
    } catch (error) {
      console.error('Error fetching movie:', error);
    } finally {
      setLoading(false);
    }
  }

  // Exibir mensagem de carregamento
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Exibir mensagem de erro se o filme não for encontrado
  if (!movie) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Filme não encontrado</h2>
        <Link to="/" className="text-indigo-400 hover:text-indigo-300">
          Voltar para a página inicial
        </Link>
      </div>
    );
  }

  // Obter o URL do trailer (se disponível)
  const trailerUrl = movie.videos?.results.find(
    (video) => video.site === 'YouTube' && video.type === 'Trailer'
  )?.key;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${TMDB_IMAGE_BASE_URL}/original${movie.backdrop_path})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <div className="flex items-start gap-8">
                {/* Poster */}
                <div className="hidden md:block w-64 flex-shrink-0">
                  <img
                    src={`${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 text-yellow-400" />
                      <span>{movie.vote_average.toFixed(1)}/10</span>
                    </div>
                    <span>{movie.release_date}</span>
                    <span className="capitalize">
                      {movie.genres.map((genre) => genre.name).join(', ')}
                    </span>
                  </div>
                  <p className="text-lg mb-6">{movie.overview}</p>
                  <div className="flex gap-4">
                    {trailerUrl && (
                      <a
                        href={`https://www.youtube.com/watch?v=${trailerUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition-colors"
                      >
                        <Play className="h-5 w-5" />
                        Assistir Trailer
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Section */}
      {trailerUrl && (
        <section className="container mx-auto">
          <h2 className="text-2xl font-bold mb-4">Trailer</h2>
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${trailerUrl}`}
              title={`${movie.title} Trailer`}
              className="w-full h-full rounded-lg"
              allowFullScreen
            ></iframe>
          </div>
        </section>
      )}
    </div>
  );
}