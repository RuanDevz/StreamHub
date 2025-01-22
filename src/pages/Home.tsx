import React from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import { Play, Star } from 'lucide-react';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface TMDbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids?: number[];
}

export default function Home() {
  const [latestMovies, setLatestMovies] = React.useState<TMDbMovie[]>([]);
  const [popularMovies, setPopularMovies] = React.useState<TMDbMovie[]>([]);
  const [actionMovies, setActionMovies] = React.useState<TMDbMovie[]>([]);
  const [comedyMovies, setComedyMovies] = React.useState<TMDbMovie[]>([]);
  const [genres, setGenres] = React.useState<{ [key: number]: string }>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchData();
  }, []);

  async function fetchMoviesByGenre(genreId: number): Promise<TMDbMovie[]> {
    const response = await fetch(
      `${import.meta.env.VITE_TMDB_BASE_URL}/discover/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=pt-BR&with_genres=${genreId}`
    );
    const data = await response.json();
    return data.results;
  }

  async function fetchPopularMovies(): Promise<TMDbMovie[]> {
    const response = await fetch(
      `${import.meta.env.VITE_TMDB_BASE_URL}/movie/popular?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=pt-BR`
    );
    const data = await response.json();
    return data.results;
  }

  async function fetchGenres(): Promise<{ id: number; name: string }[]> {
    const response = await fetch(
      `${import.meta.env.VITE_TMDB_BASE_URL}/genre/movie/list?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=pt-BR`
    );
    const data = await response.json();
    return data.genres;
  }

  async function fetchData() {
    setLoading(true);
    setError(null);

    try {
      const popularMovies = await fetchPopularMovies();
      setPopularMovies(popularMovies);
      setLatestMovies(popularMovies.slice(0, 10));

      const actionMovies = await fetchMoviesByGenre(28);
      setActionMovies(actionMovies);

      const comedyMovies = await fetchMoviesByGenre(35);
      setComedyMovies(comedyMovies);

      const genresResponse = await fetchGenres();
      const genresMap = genresResponse.reduce((acc, genre) => {
        acc[genre.id] = genre.name;
        return acc;
      }, {} as { [key: number]: string });
      setGenres(genresMap);
    } catch (error) {
      setError('Erro ao carregar os filmes. Tente novamente mais tarde.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  const movieGridSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 5,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        }
      }
    ]
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-8 pt-16">
      <section className="relative">
        <Slider {...sliderSettings}>
          {latestMovies.map((movie) => (
            <div key={movie.id} className="relative h-[60vh] min-h-[400px]">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(${import.meta.env.VITE_TMDB_IMAGE_BASE_URL}/original${movie.backdrop_path})`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h2 className="text-4xl font-bold mb-4">{movie.title}</h2>
                  <p className="text-lg mb-4 line-clamp-2">{movie.overview}</p>
                  <Link 
                    to={`/movie/${movie.id}`}
                    className="inline-flex items-center gap-2 bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition-colors"
                  >
                    <Play className="h-5 w-5" />
                    Assistir Agora
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Mais Populares</h2>
        <Slider {...movieGridSettings}>
          {popularMovies.map((movie) => (
            <div key={movie.id} className="px-2">
              <Link to={`/movie/${movie.id}`} className="block group">
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                  <img 
                    src={`${import.meta.env.VITE_TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}`} 
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = '/path/to/fallback-image.jpg';
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded-md flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm">{movie.vote_average.toFixed(1)}</span>
                  </div>
                </div>
                <h3 className="mt-2 font-semibold group-hover:text-indigo-400 transition-colors">
                  {movie.title}
                </h3>
              </Link>
            </div>
          ))}
        </Slider>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Filmes de Ação</h2>
        <Slider {...movieGridSettings}>
          {actionMovies.map((movie) => (
            <div key={movie.id} className="px-2">
              <Link to={`/movie/${movie.id}`} className="block group">
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                  <img 
                    src={`${import.meta.env.VITE_TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}`} 
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = '/path/to/fallback-image.jpg';
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded-md flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm">{movie.vote_average.toFixed(1)}</span>
                  </div>
                </div>
                <h3 className="mt-2 font-semibold group-hover:text-indigo-400 transition-colors">
                  {movie.title}
                </h3>
              </Link>
            </div>
          ))}
        </Slider>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Filmes de Comédia</h2>
        <Slider {...movieGridSettings}>
          {comedyMovies.map((movie) => (
            <div key={movie.id} className="px-2">
              <Link to={`/movie/${movie.id}`} className="block group">
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                  <img 
                    src={`${import.meta.env.VITE_TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}`} 
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = '/path/to/fallback-image.jpg';
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded-md flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm">{movie.vote_average.toFixed(1)}</span>
                  </div>
                </div>
                <h3 className="mt-2 font-semibold group-hover:text-indigo-400 transition-colors">
                  {movie.title}
                </h3>
              </Link>
            </div>
          ))}
        </Slider>
      </section>
    </div>
  );
}