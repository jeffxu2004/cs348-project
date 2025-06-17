import { useState } from "react";
import axios from "axios";

export default function MovieSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.get(
                `http://localhost:3000/search?q=${encodeURIComponent(query)}`
            );
            setResults(res.data);
        } catch (err) {
            console.error("Error fetching search results:", err);
        }
    };

    return (
        <div style={{ padding: "1rem" }}>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Search movies"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit">Search</button>
            </form>

            <ul>
                {results.map((movie) => (
                    <li key={movie.tid}>
                        {movie.primaryTitle} ({movie.startYear})
                    </li>
                ))}
            </ul>
        </div>
    );
}
