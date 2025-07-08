import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import EditMovieForm from "./EditMovieForm";

export default function MovieDetailPage() {
  const { tconst } = useParams();
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

  if (!movie) return <p className="loading-screen">Loading...</p>;

  return (
    <div className="container">
      <div className="section">
        <h2>{movie.primary_title} ({movie.release_year})</h2>
        <p><strong>Runtime:</strong> {movie.runtime} min</p>
        <p><strong>Rating:</strong> {movie.average_rating} ({movie.numvotes} votes)</p>

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
