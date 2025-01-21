import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Search, User, LogOut, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const TMDB_API_KEY = '98acb4c551844c564ac58eeb4ef47728';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<TMDbMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  interface TMDbMovie {
    id: number;
    title: string;
    poster_path: string;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const fetchSuggestions = async (query: string) => {
    if (query.trim()) {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        setSuggestions(data.results.slice(0, 5));
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchSuggestions(query);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (movie: TMDbMovie) => {
    setSearchQuery(movie.title);
    setSuggestions([]);
    navigate(`/movie/${movie.id}`);
  };

  return (
    <nav className="bg-gray-800 shadow-lg fixed w-full z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Film className="h-8 w-8 text-indigo-500" />
            <span className="text-xl font-bold">StreamHub</span>
          </Link>

          <div className="flex-1 max-w-xl mx-8 relative">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search movies, series, anime..."
                value={searchQuery}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button type="submit" className="absolute left-3 top-2.5">
                {isLoading ? (
                  <Loader className="h-5 w-5 text-gray-400 animate-spin" />
                ) : (
                  <Search className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </form>

            {suggestions.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
                {suggestions.map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => handleSuggestionClick(movie)}
                    className="flex items-center p-2 hover:bg-gray-600 cursor-pointer transition-colors"
                  >
                    <img
                      src={`${TMDB_IMAGE_BASE_URL}/w92${movie.poster_path}`}
                      alt={movie.title}
                      className="w-12 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = '/path/to/fallback-image.jpg';
                      }}
                    />
                    <span className="ml-3 text-white">{movie.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {profile?.is_admin && (
                  <Link
                    to="/admin"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>{profile?.username}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}