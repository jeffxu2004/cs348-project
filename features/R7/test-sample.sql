USE movie_app;

SELECT
    t.tconst,
    t.primary_title,
    t.numvotes,
    t.average_rating,
    t.runtime,
    t.release_year,
    GROUP_CONCAT(DISTINCT pd.name SEPARATOR ', ')   AS directors,
    GROUP_CONCAT(DISTINCT pw.name SEPARATOR ', ')   AS writers,
    GROUP_CONCAT(DISTINCT g.genres SEPARATOR ', ')  AS genres
    FROM title AS t
    LEFT JOIN director AS d  ON t.tconst = d.tconst
    LEFT JOIN people   AS pd ON d.nconst = pd.nconst
    LEFT JOIN writer    AS w ON t.tconst = w.tconst
    LEFT JOIN people   AS pw ON w.nconst = pw.nconst
    LEFT JOIN genres    AS g ON t.tconst = g.tconst
GROUP BY t.tconst, t.primary_title, t.numvotes, t.runtime, t.release_year;
