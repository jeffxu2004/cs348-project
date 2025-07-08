import { useParams, useNavigate } from "react-router-dom";
import { createContext, useEffect, useState, useContext } from "react";
import { Trash2 } from 'lucide-react';
import EditMovieForm from "./EditMovieForm";

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

  useEffect(() => {
    fetch(`http://localhost:3000/movies/${tconst}`, { credentials: "include" })
      .then((res) => res.json())
      .then(setMovie)
      .catch(console.error);

    fetch("http://localhost:3000/me", { credentials: "include" })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setUser(data?.user || null));
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
  

  if (!movie) return <p className="loading-screen">Loading...</p>;

  return (
    <div className="container">
      <div className="section">
        <h2>{movie.primary_title} ({movie.release_year})</h2>
        <p><strong>Runtime:</strong> {movie.runtime} min</p>
        <p><strong>Rating:</strong> {movie.average_rating} ({movie.numvotes} votes)</p>
        <p><strong>Directors:</strong> {movie.directors || '—'}</p>
        <p><strong>Writers:</strong> {movie.writers || '—'}</p>
        <p><strong>Genres:</strong> {movie.genres || '—'}</p>
    
        {user?.isAdmin && (
          <button
            onClick={handleDelete}
            className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 mt-4"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete Movie
          </button>
        )}

        {user?.isAdmin && (
          <button
            onClick={() => setShowEdit(!showEdit)}
            className="button-primary"
            style={{ marginTop: "1rem" }}
          >
            {showEdit ? "Cancel" : "Edit Movie"}
          </button>
        )}
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
    </div>
  );
}
