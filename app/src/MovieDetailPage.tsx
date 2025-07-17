import { useParams, useNavigate, Link } from "react-router-dom";
import { createContext, useEffect, useState, useContext } from "react";
import { Trash2 } from 'lucide-react';
import EditMovieForm from "./EditMovieForm";
import ActorList from "./ActorList";

const AuthContext = createContext(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};


export default function MovieDetailPage() {
  const { tconst } = useParams();
  //const { user_auth } = useAuth();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [user, setUser] = useState(null); // to check admin rights
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await fetch(`http://localhost:3000/movie/${tconst}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Movie not found');
        const data = await res.json();
        setMovie(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [tconst]);

  useEffect(() => {
  fetch("http://localhost:3000/me", { credentials: "include" })
    .then(res => res.ok ? res.json() : null)
    .then(data => setUser(data?.user || null));

  fetch("http://localhost:3000/favorites", { credentials: "include" })
    .then(res => res.ok ? res.json() : [])
    .then(favs => {
      const isFav = favs.some(f => f.tconst === tconst);
      setIsFavorite(isFav);
    });
  }, [tconst]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    try {
      const res = await fetch(`http://localhost:3000/movies/${tconst}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) navigate('/');
      else alert('Failed to delete');
    } catch {
      alert('Server error');
    }
  };
  
  const toggleFavorite = async () => {
    if (isFavorite) {
      // Remove favorite
      const res = await fetch(`http://localhost:3000/favorites/${tconst}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) setIsFavorite(false);
      else alert("Failed to remove favorite");
    } else {
      // Add favorite
      const res = await fetch(`http://localhost:3000/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ tconst }),
      });
      if (res.ok) setIsFavorite(true);
      else alert("Failed to add favorite");
    }
  };


  if (!movie) return <p className="loading-screen">Loading...</p>;

  return (
    <div className="container">
      <div className="section">
        <h2>{movie.primary_title} ({movie.release_year})</h2>
        <p><strong>Runtime:</strong> {movie.runtime} min</p>
        <p><strong>Rating:</strong> {movie.average_rating} ({movie.numvotes} votes)</p>
        <p><strong>Directors:</strong> {movie.directors?.length ? movie.directors.join(", ") : '—'}</p>
        <p><strong>Writers:</strong> {movie.writers?.length ? movie.writers.join(", ") : '—'}</p>
        <p><strong>Genres:</strong> {movie.genres?.length ? movie.genres.join(", ") : '—'}</p>
        <ActorList actors={movie.cast} />
        {user && (
          <div>
            <button onClick={toggleFavorite} aria-label={isFavorite ? "Unfavorite" : "Favorite"}>
              <span style={{ color: isFavorite ? "red" : "black", display: 'inline-block', width: '1.2em', textAlign: 'center' }}>
                {isFavorite ? '❤︎' : '♡'}
              </span>
              {isFavorite ? " Unfavourite" : " Favourite"}
            </button>
          </div>
        )}

        {user?.isAdmin ? (
          <button
            onClick={handleDelete}
            className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 mt-4"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete Movie
          </button>
        ) : null}

        {user?.isAdmin ? (
          <button
            onClick={() => setShowEdit(!showEdit)}
            className="button-primary"
            style={{ marginTop: "1rem" }}
          >
            {showEdit ? "Cancel" : "Edit Movie"}
          </button>
        ) : null}
      </div>

      {showEdit && user?.isAdmin && (
        <EditMovieForm
          movie={movie}
          onSave={() => {
            setShowEdit(false);
            fetch(`http://localhost:3000/movies/${tconst}`, { credentials: "include" })
              .then((res) => res.json())
              .then(setMovie);
          }}
        />
      )}
    <Link to="/" className="movie-button">← Back to movies</Link>
    </div>
  );
}