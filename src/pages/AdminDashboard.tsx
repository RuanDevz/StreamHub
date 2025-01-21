import React from 'react';
import { Plus, Pencil, Trash2, Search, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Movie } from '../types/database';
import { tmdb } from '../lib/tmdb';

export default function AdminDashboard() {
  const [movies, setMovies] = React.useState<Movie[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [importing, setImporting] = React.useState(false);

  async function fetchMovies() {
    try {
     
      const response = await fetch('/api/movies');
      const data = await response.json();
      setMovies(data || []);
    } catch (error) {
      console.error('Error fetching movies:', error);
      toast.error('Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;

    try {
      // Substitua por sua lógica para deletar um filme na API personalizada
      const response = await fetch(`/api/movies/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete movie');

      setMovies(movies.filter(movie => movie.id !== id));
      toast.success('Movie deleted successfully');
    } catch (error) {
      console.error('Error deleting movie:', error);
      toast.error('Failed to delete movie');
    }
  }

  async function importFromTMDb() {
    setImporting(true);
    try {
      // Buscar filmes populares do TMDb
      const tmdbMovies = await tmdb.getPopularMovies();

      // Converter e preparar filmes para importação
      const moviesToImport = await Promise.all(
        tmdbMovies.slice(0, 10).map(async (tmdbMovie: any) => {
          // Buscar vídeos para o trailer
          const videos = await tmdb.getMovieVideos(tmdbMovie.id);
          const movie = tmdb.convertToMovie(tmdbMovie);
          movie.trailer_url = tmdb.getTrailerUrl(videos);
          return movie;
        })
      );

      // Inserir filmes na API personalizada
      const response = await fetch('/api/movies/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moviesToImport),
      });

      if (!response.ok) throw new Error('Failed to import movies');

      toast.success('Movies imported successfully');
      fetchMovies();
    } catch (error) {
      console.error('Error importing movies:', error);
      toast.error('Failed to import movies');
    } finally {
      setImporting(false);
    }
  }

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Movie Management</h1>
        <div className="flex gap-2">
          <button
            onClick={importFromTMDb}
            disabled={importing}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Download className="h-5 w-5" />
            {importing ? 'Importing...' : 'Import from TMDb'}
          </button>
          <button
            onClick={() => {/* TODO: Implement add movie modal */}}
            className="inline-flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Movie
          </button>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search movies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 pl-10 bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4">Title</th>
                <th className="text-left py-3 px-4">Category</th>
                <th className="text-left py-3 px-4">Rating</th>
                <th className="text-left py-3 px-4">Release Date</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovies.map((movie) => (
                <tr key={movie.id} className="border-b border-gray-700">
                  <td className="py-3 px-4">{movie.title}</td>
                  <td className="py-3 px-4 capitalize">{movie.category}</td>
                  <td className="py-3 px-4">{movie.rating}/10</td>
                  <td className="py-3 px-4">{movie.release_date}</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {/* TODO: Implement edit modal */}}
                        className="p-1 hover:text-indigo-400 transition-colors"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(movie.id)}
                        className="p-1 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}