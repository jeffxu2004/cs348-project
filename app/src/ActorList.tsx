import { Link } from "react-router-dom";

interface Actor {
  nconst: string;
  name: string;
  character?: string;
}

interface ActorListProps {
  actors: Actor[];
}

const ActorList: React.FC<ActorListProps> = ({ actors }) => {
  if (!actors || actors.length === 0) return null;

  return (
    <div className="mt-4">
      <strong>Cast:</strong>
      <ul>
        {actors.map((actor) => (
          <li key={actor.nconst}>
            <Link to={`/people/${actor.nconst}`} className="movie-button">
              {actor.name}
            </Link>
            {actor.character ? ` as ${actor.character}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActorList;
