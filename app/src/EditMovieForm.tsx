import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditMovieForm() {
  const { tconst } = useParams<{ tconst: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    primary_title: "",
    release_year: "",
    runtime: "",
    average_rating: "",
    numvotes: "",
  });

  useEffect(() => {
    if (!tconst) return;

    fetch(`http://localhost:3000/movies/${tconst}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch movie");
        return res.json();
      })
      .then((data) => {
        setFormData({
          primary_title: data.primary_title || "",
          release_year: data.release_year || "",
          runtime: data.runtime || "",
          average_rating: data.average_rating || "",
          numvotes: data.numvotes || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [tconst]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:3000/movies/${tconst}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (res.ok) {
        alert("Movie updated successfully!");
        navigate(`/movies/${tconst}`);
      } else {
        alert(result.error || "Update failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  if (loading) return <div>Loading movie data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <form onSubmit={handleSubmit} className="section">
      <h2>Edit Movie</h2>
      {[
        "primary_title",
        "release_year",
        "runtime",
        "average_rating",
        "numvotes",
      ].map((field) => (
        <div className="input-group" key={field}>
          <label className="input-label">
            {field.replace("_", " ").toUpperCase()}
          </label>
          <input
            className="input-field"
            name={field}
            value={formData[field]}
            onChange={handleChange}
            type={["release_year", "runtime", "numvotes"].includes(field) ? "number" : "text"}
          />
        </div>
      ))}
      <button className="button-primary" type="submit">
        Save
      </button>
    </form>
  );
}
