USE movie_app;

WITH user_genre_count AS (
   SELECT userid, genres.genres AS genres, COUNT(favorites.tconst) AS user_favorite
   FROM favorites
   INNER JOIN genres
   ON favorites.tconst = genres.tconst
   GROUP BY userid, genres
), total_movies AS (
   SELECT userid, COUNT(tconst) AS total_favorite
   FROM favorites
   GROUP BY userid
), proportion AS (
   SELECT total_movies.userid AS userid, genres, user_favorite/total_favorite AS user_p
   FROM user_genre_count
   JOIN total_movies
   on user_genre_count.userid = total_movies.userid
), gini_table AS (
   SELECT userid, IFNULL(-SUM(user_p * LOG(user_p, 2)), 0) AS gini_index
   FROM proportion
   GROUP BY userid
)

SELECT *
FROM gini_table