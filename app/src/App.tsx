import React, { createContext, useContext, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";
import {
  User,
  Lock,
  LogIn,
  LogOut,
  Heart,
  Search,
  Trash2,
  PlusCircle,
} from "lucide-react";
import MovieDetailPage from "./MovieDetailPage";
import EditMovieForm from "./EditMovieForm";
import ActorDetailPage from "./ActorDetailPage"
import SharedMoviesPage from "./SharedMoviesPage";
import "./App.css";

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

    const result = await login(username, password);

    if (!result.success) {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <div className="loading-screen">
      <div className="login-box">
        <div className="user-icon-wrapper">
          <User className="user-icon" />
        </div>
        <h1>Welcome Back</h1>
        <p>Sign in to your movie account</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={isLoading} className="login-button">
            {isLoading ? "Signing in..." : <><LogIn className="login-icon" /> Sign In</>}
          </button>
        </form>

        <div className="demo-users">
          <p>Demo Users:</p>
          <div className="demo-user-credentials">
            <div>User: alice<br />Pass: passAlice123</div>
            <div>Admin: admin<br />Pass: admin</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Header = () => {
  const { user, logout } = useAuth();
  const [gini, setGini] = useState<number | null>(null);
  const [percentile, setPercentile] = useState<number | null>(null);

  useEffect(() => {
    // when we get a user, fetch its gini
    if (!user?.userid) return;
    (async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/users/${user.userid}/gini`,
          { credentials: "include" }
        );
        if (res.ok) {
          const { gini_index } = await res.json();
          setGini(gini_index);
          // Now fetch percentile
          const percentileRes = await fetch(
            `http://localhost:3000/gini-percentile?value=${gini_index}`,
            { credentials: "include" }
          );
          if (percentileRes.ok) {
            const { percentile } = await percentileRes.json();
            setPercentile(percentile);
          }
        }

      } catch (err) {
        console.error("Could not load gini score or percentile:", err);
      }
    })();
  }, [user]);

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center space-x-2">
          <span>🎬</span>
          <span>Movie App</span>
        </h1>

        <div className="flex items-center justify-between">
          <span className="text-blue-100">Welcome, {user?.username}!</span>
          {user?.isAdmin ? (
            <span className="bg-yellow-500 text-yellow-900 px-2 py-1 rounded text-xs font-medium">
              Admin
            </span>
          ) : null}
          &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;
          <button
            onClick={logout}
            className="ml-auto flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
          <div className="flex items-center justify-between">
          {/* show Gini if available */}
          {gini !== null && (
            <span className="ml-4 bg-white/20 text-white px-2 py-1 rounded text-sm">
              Genres Diversity Index: {gini.toFixed(2)} <br/>
              Your diversity index is better than {percentile}% of user
            </span>
          )}
          </div>
      </div>
    </header>
  );
};

const MovieDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchIn, setSearchIn]     = useState("title");
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
  ];

  const [sortPath, setSortPath] = useState("/movies/top-rated");

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
      const url = new URL("http://localhost:3000/search");
      url.searchParams.set("q", searchQuery);
      url.searchParams.set("searchIn", searchIn);

      const response = await fetch(url.toString());
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
    const url = `http://localhost:3000/favorites${isFav ? "/" + tconst : ""}`;
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

      {user?.isAdmin && <AddMovieForm onAdded={() => loadAllMovies()} />}

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
                onKeyPress={(e) => e.key === "Enter" && handleSearch(e)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search for movies..."
              />
            </div>
            <select
              value={searchIn}
              onChange={(e) => setSearchIn(e.target.value)}
              className="border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="title">Title only</option>
              <option value="full">Title + Plot</option>
            </select>
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
                      <p className="text-gray-600">{movie.release_year}</p>
                    </div>
                    <button
                      onClick={() => toggleFavorite(movie.tconst)}
                      className="flex items-center space-x-2 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          favorites.some((m) => m.tconst === movie.tconst)
                            ? "text-yellow-300"
                            : "text-white"
                        }`}
                      />
                      <span>
                        {favorites.some((m) => m.tconst === movie.tconst)
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
              No favorites yet. Search for movies and add them to your
              favorites!
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {favorites.map((movie) => (
                <div
                  key={movie.tconst}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <Link to={`/movies/${movie.tconst}`} className="movie-button">
                    {movie.primary_title}
                  </Link>
                  <p className="text-gray-600">Year: {movie.release_year}</p>
                  {movie.average_rating && (
                    <p className="text-yellow-600">
                      ⭐ {movie.average_rating.toFixed(1)}/10
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
              <li key={movie.tconst} className="border p-3 rounded-lg">
                <div className="font-medium">
                  <Link to={`/movies/${movie.tconst}`} className="movie-button">
                    {movie.primary_title}
                  </Link>{" "}
                  ({movie.release_year})
                </div>
                <div className="text-gray-600 text-sm">
                  Votes: {movie.numvotes} • Rating:{" "}
                  {movie.average_rating.toFixed(1)} • Runtime: {movie.runtime}{" "}
                  min
                </div>
                <div className="mt-2 text-gray-800"></div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const AddMovieForm = ({ onAdded }: { onAdded: () => void }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    tconst: "",
    primary_title: "",
    release_year: "",
    runtime: "",
    average_rating: "0",
    numvotes: "0",
    genres: "",
    directors: "",
    writers: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const body = {
        ...form,
        release_year: Number(form.release_year),
        runtime: Number(form.runtime),
        average_rating: Number(form.average_rating),
        numvotes: Number(form.numvotes),
        genres: form.genres
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        directors: form.directors
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        writers: form.writers
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const res = await fetch("http://localhost:3000/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        setForm({
          tconst: "",
          primary_title: "",
          release_year: "",
          runtime: "",
          average_rating: "0",
          numvotes: "0",
          genres: "",
          directors: "",
          writers: "",
        });
        onAdded();
      } else {
        setError(data.error || "Failed to add movie");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  if (!user?.isAdmin) return null;

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center space-x-2">
        <PlusCircle /> <span>Add New Movie</span>
      </h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {[
          { name: "tconst", label: "Movie ID (tconst)" },
          { name: "primary_title", label: "Title" },
          { name: "release_year", label: "Year", type: "number" },
          { name: "runtime", label: "Runtime (min)", type: "number" },
          { name: "average_rating", label: "Rating", type: "number" },
          { name: "numvotes", label: "Votes", type: "number" },
          { name: "genres", label: "Genres (csv)" },
          { name: "directors", label: "Director IDs (csv)" },
          { name: "writers", label: "Writer IDs (csv)" },
        ].map(({ name, label, type }) => (
          <div key={name}>
            <label>{label}</label>
            <input
              name={name}
              type={type || "text"}
              value={(form as any)[name]}
              onChange={handleChange}
              required={name === "tconst" || name === "primary_title"}
            />
          </div>
        ))}
        <div>
          <button
            type="submit"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Movie
          </button>
        </div>
      </form>
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
          <Route path="/movies/:tconst" element={<MovieDetailPage />} />
          <Route path="/movies/:tconst/edit" element={<EditMovieForm />} />
          <Route path="/people/:nconst" element={<ActorDetailPage />} />
          <Route path="/shared-movies/:actor1/:actor2" element={<SharedMoviesPage />} />
          <Route path="/*" element={<MovieApp />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
