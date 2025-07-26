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
  const [similarMovies, setSimilarMovies] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState('');
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [hasExistingReview, setHasExistingReview] = useState(false);


  useEffect(() => {
    // Fetch all reviews for this movie
    const fetchReviews = async () => {
      try {
        const res = await fetch(`http://localhost:3000/reviews/${tconst}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      }
    };

    // Fetch user's own review if logged in
    const fetchUserReview = async () => {
      if (user) {
        try {
          const res = await fetch(`http://localhost:3000/reviews/${tconst}/my-review`, { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            setUserReview(data.content);
            setHasExistingReview(true);
          } else {
            setUserReview('');
            setHasExistingReview(false);
          }
        } catch (err) {
          // User doesn't have a review yet, that's fine
          setUserReview('');
          setHasExistingReview(false);
        }
      }
    };

    fetchReviews();
    fetchUserReview();
  }, [tconst, user]);

  // Add these handler functions after the existing handler functions
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!userReview.trim()) return;

    try {
      const res = await fetch(`http://localhost:3000/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ tconst, content: userReview.trim() }),
      });

      if (res.ok) {
        setIsEditingReview(false);
        setHasExistingReview(true);
        // Refresh reviews
        const reviewsRes = await fetch(`http://localhost:3000/reviews/${tconst}`, { credentials: 'include' });
        if (reviewsRes.ok) {
          const data = await reviewsRes.json();
          setReviews(data);
        }
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to save review');
      }
    } catch (err) {
      alert('Failed to save review');
    }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;

    try {
      const res = await fetch(`http://localhost:3000/reviews/${tconst}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        setUserReview('');
        setIsEditingReview(false);
        setHasExistingReview(false);
        // Refresh reviews
        const reviewsRes = await fetch(`http://localhost:3000/reviews/${tconst}`, { credentials: 'include' });
        if (reviewsRes.ok) {
          const data = await reviewsRes.json();
          setReviews(data);
        }
      } else {
        alert('Failed to delete review');
      }
    } catch (err) {
      alert('Failed to delete review');
    }
  };


  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await fetch(`http://localhost:3000/movie/${tconst}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Movie not found');
        const data = await res.json();
        setMovie(data);
      } catch (err) {
        console.error(err);
      }
    };
    
    const fetchSimilarMovies = async () => {
      try {
        const res = await fetch(`http://localhost:3000/movies/similar/${tconst}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setSimilarMovies(data);
        }
      } catch (err) {
        console.error('Failed to fetch similar movies:', err);
      }
    };
    
    fetchMovie();
    fetchSimilarMovies();
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
        {movie?.plot != null ? <p><strong>Plot:</strong> {movie.plot}</p> : null}
        <p><strong>Runtime:</strong> {movie.runtime} min</p>
        <p><strong>Rating:</strong> {movie.average_rating.toFixed(2)} ({movie.numvotes} votes)</p>
        <p><strong>Directors:</strong> {movie.directors?.length ? movie.directors.join(", ") : '—'}</p>
        <p><strong>Writers:</strong> {movie.writers?.length ? movie.writers.join(", ") : '—'}</p>
        <p><strong>Genres:</strong> {movie.genres?.length ? movie.genres.join(", ") : '—'}</p>
        <ActorList actors={movie.cast} />
        
        {/* Similar Movies Section */}
        {similarMovies.length > 0 && (
          <div className="section">
            <h3>Similar movies...</h3>
            <div className="similar-movies-grid">
              {similarMovies.slice(0, 5).map((similarMovie: any) => (
                <div key={similarMovie.tconst} className="similar-movie-item">
                  <Link 
                    to={`/movies/${similarMovie.tconst}`} 
                    className="movie-button"
                    style={{ textDecoration: 'none', fontSize: '14px' }}
                  >
                    {similarMovie.primary_title}
                  </Link>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {similarMovie.release_year} • ⭐ {similarMovie.average_rating?.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

  {/* Reviews Section */}
        <div className="section">
          <h3>Reviews</h3>
          
          {user && (
            <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
              {!isEditingReview && hasExistingReview ? (
                <div>
                  <h4 style={{marginBottom: '0.5rem' }}>Your Review:</h4>
                  <p style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '1rem', 
                    borderRadius: '4px',
                    color: '#333',
                    lineHeight: '1.5',
                    margin: '0 0 0.5rem 0'
                  }}>
                    {userReview}
                  </p>
                  <div style={{ marginTop: '0.5rem' }}>
                    <button 
                      onClick={() => setIsEditingReview(true)}
                      style={{ 
                        marginRight: '0.5rem',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Edit Review
                    </button>
                    <button 
                      onClick={handleDeleteReview}
                      style={{ 
                        backgroundColor: '#dc3545', 
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete Review
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit}>
                  <h4 style={{ marginBottom: '0.5rem' }}>
                    {hasExistingReview ? 'Edit Your Review:' : 'Write a Review:'}
                  </h4>
                  <textarea
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                    placeholder="Share your thoughts about this movie..."
                    rows={4}
                    maxLength={512}
                    style={{ 
                      width: '100%', 
                      padding: '0.5rem', 
                      border: '1px solid #ccc', 
                      borderRadius: '4px',
                      resize: 'vertical',
                      fontSize: '14px',
                      color: '#333',
                      backgroundColor: '#fff'
                    }}
                  />
                  <div style={{ marginTop: '0.5rem', fontSize: '0.9em', color: '#666' }}>
                    {userReview.length}/512 characters
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <button 
                      type="submit"
                      disabled={!userReview.trim()}
                      style={{ 
                        marginRight: '0.5rem',
                        backgroundColor: !userReview.trim() ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: !userReview.trim() ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {hasExistingReview && !isEditingReview ? 'Update Review' : 'Submit Review'}
                    </button>
                    {isEditingReview && (
                      <button 
                        type="button"
                        onClick={() => {
                          setIsEditingReview(false);
                          // Reset to original review if user cancels editing
                          fetch(`http://localhost:3000/reviews/${tconst}/my-review`, { credentials: 'include' })
                            .then(res => res.ok ? res.json() : { content: '' })
                            .then(data => setUserReview(data.content || ''));
                        }}
                        style={{
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {reviews.length > 0 ? (
            <div>
              <h4 style={{ marginBottom: '1rem' }}>All Reviews ({reviews.length}):</h4>
              {reviews.map((review, index) => (
                <div 
                  key={`${review.userid}-${index}`} 
                  style={{ 
                    marginBottom: '1rem', 
                    padding: '1rem', 
                    backgroundColor: '#f9f9f9', 
                    borderRadius: '8px',
                    borderLeft: user?.userid === review.userid ? '4px solid #007bff' : '4px solid transparent',
                    border: '1px solid #e9ecef'
                  }}
                >
                  <div style={{ 
                    fontWeight: 'bold', 
                    marginBottom: '0.5rem',
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    {review.username}
                    {user?.userid === review.userid && (
                      <span style={{ color: '#007bff', fontSize: '0.9em', fontWeight: 'normal' }}> (You)</span>
                    )}
                  </div>
                  <p style={{ 
                    margin: '0', 
                    lineHeight: '1.5',
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    {review.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#777', fontStyle: 'italic', fontSize: '14px' }}>
              No reviews yet. Be the first to review this movie!
            </p>
          )}
        </div>
        
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