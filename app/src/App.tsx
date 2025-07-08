import { Heart, Lock, LogIn, LogOut, Search, User } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";
import {
    Link,
    Route,
    BrowserRouter as Router,
    Routes,
    useParams,
} from "react-router-dom";
import "./App.css";
import EditMovieForm from "./EditMovieForm";
import MovieDetailPage from "./MovieDetailPage";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch("http://localhost:3000/me", {
                credentials: "include",
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        console.log("Login function called with:", { username });
        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ username, password }),
            });

            console.log("Response status:", response.status);
            const data = await response.json();
            console.log("Response data:", data);

            if (response.ok) {
                setUser(data.user);
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, error: "Login failed. Please try again." };
        }
    };

    const logout = async () => {
        try {
            await fetch("http://localhost:3000/logout", {
                method: "POST",
                credentials: "include",
            });
            setUser(null);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};

const LoginForm = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError("");
        setIsLoading(true);

        console.log("Attempting login with:", { username, password });

        const result = await login(username, password);

        console.log("Login result:", result);

        if (!result.success) {
            setError(result.error);
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-blue-200">
                        Sign in to your movie account
                    </p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-blue-200 text-sm font-medium mb-2">
                            Username
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-blue-200 text-sm font-medium mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            <p className="text-red-200 text-sm">{error}</p>
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <LogIn className="w-5 h-5" />
                                <span>Sign In</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-white/20">
                    <p className="text-blue-200 text-sm text-center mb-4">
                        Demo Users:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white/5 rounded p-2">
                            <p className="text-blue-300">User: alice</p>
                            <p className="text-blue-300">Pass: passAlice123</p>
                        </div>
                        <div className="bg-white/5 rounded p-2">
                            <p className="text-blue-300">Admin: admin</p>
                            <p className="text-blue-300">Pass: admin</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold flex items-center space-x-2">
                    <span>🎬</span>
                    <span>Movie App</span>
                </h1>

                <div className="flex items-center space-x-4">
                    <span className="text-blue-100">
                        Welcome, {user?.username}!
                    </span>
                    {user?.isAdmin && (
                        <span className="bg-yellow-500 text-yellow-900 px-2 py-1 rounded text-xs font-medium">
                            Admin
                        </span>
                    )}
                    <button
                        onClick={logout}
                        className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

const MovieDetail = () => {
    const { tconst } = useParams(); // get movie id from url
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const res = await fetch(
                    `http://localhost:3000/movies/${tconst}`,
                    { credentials: "include" }
                );
                if (!res.ok) throw new Error("Movie not found");
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

    if (loading) return <p>Loading...</p>;
    if (!movie) return <p>Movie not found</p>;

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-3xl font-bold mb-4">
                {movie.primary_title} ({movie.release_year})
            </h2>
            <p>Votes: {movie.numvotes}</p>
            <p>Rating: {movie.average_rating.toFixed(1)}</p>
            <p>Runtime: {movie.runtime} min</p>
            <p>
                <strong>Directors:</strong> {movie.directors || "—"}
            </p>
            <p>
                <strong>Writers:</strong> {movie.writers || "—"}
            </p>
            <p>
                <strong>Genres:</strong> {movie.genres || "—"}
            </p>
            <Link to="/" className="movie-button">
                ← Back to movies
            </Link>
        </div>
    );
};

const MovieDashboard = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [allMovies, setAllMovies] = useState([]);
    const [loadingAll, setLoadingAll] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        loadFavorites();
    }, []);

    const sortOptions = [
        { label: "Top 100 Rated", path: "/movies/top-rated" },
        { label: "Most Popular", path: "/movies/most-popular" },
        { label: "Best of This Year", path: "/movies/best-of-year" },
        { label: "Random Picks", path: "/movies/random" },
        { label: "All Movies", path: "/movies/all" },
    ];

    const [sortPath, setSortPath] = useState("/movies/all");

    useEffect(() => {
        const loadSortedMovies = async () => {
            setLoadingAll(true);
            try {
                const res = await fetch(`http://localhost:3000${sortPath}`, {
                    credentials: "include",
                });
                if (!res.ok) throw new Error(`Server error: ${res.status}`);
                const movies = await res.json();
                setAllMovies(movies);
            } catch (err) {
                console.error("Failed to load sorted movies:", err);
            } finally {
                setLoadingAll(false);
            }
        };

        loadSortedMovies();
    }, [sortPath]);

    const loadAllMovies = async () => {
        setLoadingAll(true);
        try {
            const res = await fetch(`http://localhost:3000${sortPath}`, {
                credentials: "include",
            });
            if (!res.ok) {
                throw new Error(`Server error: ${res.status}`);
            }
            const movies = await res.json();
            setAllMovies(movies);
        } catch (err) {
            console.error("Failed to load movies overview:", err);
        } finally {
            setLoadingAll(false);
        }
    };

    const loadFavorites = async () => {
        try {
            const response = await fetch("http://localhost:3000/favorites", {
                credentials: "include",
            });
            if (response.ok) {
                const data = await response.json();
                setFavorites(data);
            }
        } catch (error) {
            console.error("loadFavorites error:", error);
        }
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (searchQuery.length < 2) return;

        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:3000/search?q=${encodeURIComponent(
                    searchQuery
                )}`
            );
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data);
            }
        } catch (error) {
            console.error("Search failed:", error);
        }
        setLoading(false);
    };

    const toggleFavorite = async (tconst) => {
        const isFav = favorites.some((m) => m.tconst === tconst);
        const url = `http://localhost:3000/favorites${
            isFav ? "/" + tconst : ""
        }`;
        const method = isFav ? "DELETE" : "POST";

        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: isFav ? null : JSON.stringify({ tconst }),
            });

            if (response.ok) {
                loadFavorites();
            }
        } catch (error) {
            console.error("Failed to toggle favorite:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto p-6">
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Search Movies
                    </h2>
                    <div className="flex space-x-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) =>
                                    e.key === "Enter" && handleSearch(e)
                                }
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Search for movies..."
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? "Searching..." : "Search"}
                        </button>
                    </div>

                    {searchResults.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                Search Results
                            </h3>
                            <div className="grid gap-4">
                                {searchResults.map((movie) => (
                                    <div
                                        key={movie.tconst}
                                        className="flex justify-between items-center p-4 border border-gray-200 rounded-lg"
                                    >
                                        <div>
                                            <h4 className="font-medium text-gray-800">
                                                {movie.primary_title}
                                            </h4>
                                            <p className="text-gray-600">
                                                {movie.release_year}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() =>
                                                toggleFavorite(movie.tconst)
                                            }
                                            className="flex items-center space-x-2 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                            <Heart
                                                className={`w-4 h-4 ${
                                                    favorites.some(
                                                        (m) =>
                                                            m.tconst ===
                                                            movie.tconst
                                                    )
                                                        ? "text-yellow-300"
                                                        : "text-white"
                                                }`}
                                            />
                                            <span>
                                                {favorites.some(
                                                    (m) =>
                                                        m.tconst ===
                                                        movie.tconst
                                                )
                                                    ? "Remove"
                                                    : "Add"}
                                            </span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Your Favorites
                    </h2>
                    {favorites.length === 0 ? (
                        <p className="text-gray-600">
                            No favorites yet. Search for movies and add them to
                            your favorites!
                        </p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {favorites.map((movie) => (
                                <div
                                    key={movie.tconst}
                                    className="border border-gray-200 rounded-lg p-4"
                                >
                                    <Link
                                        to={`/movies/${movie.tconst}`}
                                        className="movie-button"
                                    >
                                        {movie.primary_title}
                                    </Link>
                                    <p className="text-gray-600">
                                        Year: {movie.release_year}
                                    </p>
                                    {movie.average_rating && (
                                        <p className="text-yellow-600">
                                            ⭐ {movie.average_rating}/10
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mt-8">
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Browse Movies
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {sortOptions.map((opt) => (
                                <button
                                    key={opt.path}
                                    onClick={() => setSortPath(opt.path)}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                        sortPath === opt.path
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4 flex flex-col items-center space-y-2">
                        {allMovies.length === 0 && (
                            <p className="text-gray-600">No data loaded yet.</p>
                        )}
                        <button
                            onClick={loadAllMovies}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Refresh
                        </button>
                    </div>

                    <ul className="space-y-2">
                        {allMovies.map((movie) => (
                            <li
                                key={movie.tconst}
                                className="border p-3 rounded-lg"
                            >
                                <div className="font-medium">
                                    <Link
                                        to={`/movies/${movie.tconst}`}
                                        className="movie-button"
                                    >
                                        {movie.primary_title}
                                    </Link>{" "}
                                    ({movie.release_year})
                                </div>
                                <div className="text-gray-600 text-sm">
                                    Votes: {movie.numvotes} • Rating:{" "}
                                    {movie.average_rating.toFixed(1)} • Runtime:{" "}
                                    {movie.runtime} min
                                </div>
                                <div className="mt-2 text-gray-800">
                                    <strong>Directors:</strong>{" "}
                                    {movie.directors || "—"}
                                    <br />
                                    <strong>Writers:</strong>{" "}
                                    {movie.writers || "—"}
                                    <br />
                                    <strong>Genres:</strong>{" "}
                                    {movie.genres || "—"}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const MovieApp = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return user ? <MovieDashboard /> : <LoginForm />;
};

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route
                        path="/movies/:tconst"
                        element={<MovieDetailPage />}
                    />
                    <Route
                        path="/movies/:tconst/edit"
                        element={<EditMovieForm />}
                    />
                    <Route path="/*" element={<MovieApp />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}
