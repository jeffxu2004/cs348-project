USE movie_app;

SELECT *
FROM title t
LEFT JOIN director d ON t.tconst = d.tconst
LEFT JOIN writer w ON t.tconst = w.tconst
LEFT JOIN genres g ON t.tconst = g.tconst;