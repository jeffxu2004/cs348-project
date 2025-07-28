-- Production database test: Top co-stars of Morgan Freeman
USE movie_app;

SELECT 
  p.nconst, 
  p.name, 
  COUNT(DISTINCT sp.tconst) AS sharedMoviesCount
FROM shared_principal sp
JOIN people p ON sp.nconst1 = p.nconst
WHERE sp.nconst2 = 'nm0000151'
  AND sp.nconst1 != 'nm0000151'
  AND sp.category1 IN ('actor', 'actress')
  AND sp.category2 IN ('actor', 'actress')
GROUP BY p.nconst, p.name
ORDER BY sharedMoviesCount DESC, p.name
LIMIT 20;

-- Production database test: Shared movies between Morgan Freeman and Tim Robbins

SELECT DISTINCT
  t.tconst,
  t.primary_title,
  t.release_year,
  MAX(p1.name) AS actor1_name,
  MAX(p2.name) AS actor2_name
FROM shared_principal sp
JOIN title t ON t.tconst = sp.tconst
JOIN people p1 ON sp.nconst1 = p1.nconst
JOIN people p2 ON sp.nconst2 = p2.nconst
WHERE sp.nconst1 = 'nm0000151'
  AND sp.nconst2 = 'nm0000209'
  AND sp.category1 IN ('actor', 'actress')
  AND sp.category2 IN ('actor', 'actress')
GROUP BY t.tconst, t.primary_title, t.release_year
ORDER BY t.primary_title;