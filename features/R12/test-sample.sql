USE movie_app;

SELECT primary_title, numvotes, average_rating, plot, MATCH(primary_title, plot) AGAINST ('World of Men against Sauron') AS relevance
FROM title
WHERE MATCH(primary_title, plot) AGAINST ('World of Men against Sauron' IN NATURAL LANGUAGE MODE)
ORDER BY relevance DESC
LIMIT 10;