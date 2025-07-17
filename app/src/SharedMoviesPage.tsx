import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

interface Movie {
  tconst: string;
  primary_title: string;
  release_year: number;
}

export default function SharedMoviesPage() {
  const { actor1, actor2 } = useParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!actor1 || !actor2) return;

    setLoading(true);
    setError(null);
    setMovies([]);

    fetch(`http://localhost:3000/shared-movies/${actor1}/${actor2}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data.sharedMovies || !Array.isArray(data.sharedMovies)) {
          throw new Error("Invalid response format");
        }
        setMovies(data.sharedMovies);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setError(error.message || "Unknown error");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [actor1, actor2]);

  if (loading) return <p>Loading shared movies...</p>;
  if (error) return <p>Error: {error}</p>;
  if (movies.length === 0) return <p>No shared movies found.</p>;

  const actor1Name = movies[0]?.actor1_name || "Actor 1";
  const actor2Name = movies[0]?.actor2_name || "Actor 2";

  return (
    <div className="container">
      <h2>
        Shared Movies
      </h2>
      <h3>
        Between {actor1Name} and {actor2Name}
      </h3>
      <ul>
        {movies.map((movie) => (
          <li key={movie.tconst}>
            <Link to={`/movies/${movie.tconst}`} className="movie-button">
              {movie.primary_title} {movie.release_year ? `(${movie.release_year})` : ''}
            </Link>
          </li>
        ))}
      </ul>
      <Link to={`/people/${actor1}`} className="movie-button">
        <br></br>
        ← Back to {actor1Name}
      </Link>
      <Link to={`/people/${actor2}`} className="movie-button" style={{ marginLeft: '1rem' }}>
        <br></br>
        ← Go to {actor2Name}
      </Link>
    </div>
  );
}
