USE movie_app;


SELECT tconst, primary_title,numvotes,average_rating,runtime,release_year,plot
FROM title WHERE tconst = 'tt0072308';

SELECT genres FROM genres WHERE tconst = 'tt0072308';

SELECT p.name 
FROM director d 
JOIN people p ON d.nconst = p.nconst 
WHERE d.tconst = 'tt0072308';

SELECT p.name 
FROM writer w 
JOIN people p ON w.nconst = p.nconst 
WHERE w.tconst = 'tt0072308';

SELECT DISTINCT p.nconst, p.name, pr.character_name
FROM principal pr
JOIN people p ON pr.nconst = p.nconst
WHERE pr.tconst = 'tt0072308' AND pr.category IN ('actor', 'actress');

;


/* SELECT
   t.tconst,
   t.primary_title,
   t.numvotes,
   t.average_rating,
   t.runtime,
   t.release_year,
   t.plot,
   GROUP_CONCAT(DISTINCT pd.name SEPARATOR ', ')   AS directors,
   GROUP_CONCAT(DISTINCT pw.name SEPARATOR ', ')   AS writers,
   GROUP_CONCAT(DISTINCT g.genres SEPARATOR ', ')  AS genres
   FROM title AS t
   LEFT JOIN director AS d  ON t.tconst = d.tconst
   LEFT JOIN people   AS pd ON d.nconst = pd.nconst
   LEFT JOIN writer    AS w ON t.tconst = w.tconst
   LEFT JOIN people   AS pw ON w.nconst = pw.nconst
   LEFT JOIN genres    AS g ON t.tconst = g.tconst
   WHERE t.tconst = 'tt0072308'
GROUP BY t.tconst, t.primary_title, t.numvotes, t.runtime, t.release_year; */