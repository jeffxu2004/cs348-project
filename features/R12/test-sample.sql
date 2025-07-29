USE movie_app;

SELECT 
  tconst,
  primary_title,
  numvotes,
  average_rating,
  plot,
  MATCH(primary_title, plot) AGAINST ('A yound man fighting crime' IN NATURAL LANGUAGE MODE) AS relevance
FROM title
WHERE MATCH(primary_title, plot) AGAINST ('A yound man fighting crime' IN NATURAL LANGUAGE MODE)
ORDER BY relevance DESC
LIMIT 20
;


SELECT 
tconst,
primary_title,
numvotes,
average_rating,
plot
FROM title
WHERE primary_title LIKE '%Dark knight%'
LIMIT 20
;