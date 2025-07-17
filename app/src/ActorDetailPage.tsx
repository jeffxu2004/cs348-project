import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

interface Actor {
  nconst: string;
  name: string;
}

interface CoActor extends Actor {
  sharedMoviesCount: number;
}

export default function ActorDetailPage() {
  const { nconst } = useParams();
  const [actor, setActor] = useState<Actor | null>(null);
  const [coActors, setCoActors] = useState<CoActor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3000/people/${nconst}`)
      .then((res) => res.json())
      .then((data) => {
        setActor(data.actor);
        setCoActors(data.coActors);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [nconst]);

  if (loading) return <p>Loading...</p>;
  if (!actor) return <p>Actor not found.</p>;

  return (
    <div className="container">
      <h2>{actor.name}</h2>

      <section className="mt-6">
        <h3>Co-actors who starred in movies with {actor.name}</h3>
        {coActors.length === 0 ? (
          <p>No co-actors found.</p>
        ) : (
          <ul>
            {coActors.map((co) => (
              <li key={co.nconst}>
                <Link to={`/people/${co.nconst}`} className="movie-button">
                  {co.name}
                </Link>{" "}
                — shared movies:{" "}
                <Link
                  to={`/shared-movies/${nconst}/${co.nconst}`}
                  className="movie-button"
                >
                  {co.sharedMoviesCount}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link to="/" className="movie-button">
        ← Back to movies
      </Link>
    </div>
  );
}
