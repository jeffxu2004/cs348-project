USE movie_app;


-- Top 100 movies (filter out indie movies with small amount of ratings)
SELECT t.primary_title, t.release_year, t.average_rating, t.numvotes
FROM title t
WHERE t.numvotes > 10000
ORDER BY t.average_rating DESC, t.numvotes DESC
LIMIT 100;

-- Top 100 Most Popular Movies
SELECT t.primary_title, t.release_year, t.average_rating, t.numvotes
FROM title t
ORDER BY t.numvotes DESC
LIMIT 100;

-- Best Movies in 1999
SELECT t.primary_title, t.release_year, t.average_rating, t.numvotes
FROM title t
WHERE t.release_year = 1999
  AND t.numvotes > 5000
ORDER BY t.average_rating DESC
LIMIT 50;

-- 10 Random Movies
SELECT t.primary_title, t.release_year, t.average_rating
FROM title t
WHERE t.numvotes > 10000
ORDER BY RAND()
LIMIT 10;