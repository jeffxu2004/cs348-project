USE movie_app;

INSERT INTO user_gini_cache(userid, gini_index)
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
   SELECT userid, IFNULL(-SUM(user_p * LOG2(user_p)), 0) AS gini_index
   FROM proportion
   GROUP BY userid
)
SELECT userid, gini_index
FROM gini_table;

DROP TRIGGER IF EXISTS update_index;
DROP TRIGGER IF EXISTS remove_index;

DELIMITER $$

CREATE TRIGGER update_index
AFTER INSERT ON favorites
FOR EACH ROW
BEGIN
    DECLARE new_gini DOUBLE;

    WITH user_genre_count AS (
    SELECT userid, genres.genres AS genres, COUNT(favorites.tconst) AS user_favorite
    FROM favorites
    INNER JOIN genres
    ON favorites.tconst = genres.tconst
    WHERE favorites.userid = NEW.userid
    GROUP BY userid, genres
    ), total_movies AS (
    SELECT userid, COUNT(tconst) AS total_favorite
    FROM favorites
    WHERE favorites.userid = NEW.userid
    GROUP BY userid
    ), proportion AS (
    SELECT total_movies.userid AS userid, genres, user_favorite/total_favorite AS user_p
    FROM user_genre_count
    JOIN total_movies
    on user_genre_count.userid = total_movies.userid
    ), gini_table AS (
    SELECT userid, -SUM(user_p * LOG2(user_p)) AS gini_index
    FROM proportion
    GROUP BY userid
    )
    SELECT IFNULL(gini_index, 0)
    INTO new_gini
    FROM gini_table
    WHERE userid = NEW.userid;

    INSERT INTO user_gini_cache (userid, gini_index)
    VALUES (NEW.userid, new_gini)
    ON DUPLICATE KEY UPDATE
      gini_index = VALUES(gini_index);

END$$

CREATE TRIGGER remove_index
BEFORE DELETE ON favorites
FOR EACH ROW
BEGIN
    DECLARE new_gini DOUBLE;
    WITH user_genre_count AS (
    SELECT userid, genres.genres AS genres, COUNT(favorites.tconst) AS user_favorite
    FROM favorites
    INNER JOIN genres
    ON favorites.tconst = genres.tconst
    WHERE favorites.userid = OLD.userid
    GROUP BY userid, genres
    ), total_movies AS (
    SELECT userid, COUNT(tconst) AS total_favorite
    FROM favorites
    WHERE favorites.userid = OLD.userid
    GROUP BY userid
    ), proportion AS (
    SELECT total_movies.userid AS userid, genres, user_favorite/total_favorite AS user_p
    FROM user_genre_count
    JOIN total_movies
    on user_genre_count.userid = total_movies.userid
    ), gini_table AS (
    SELECT userid, -SUM(user_p * LOG2(user_p)) AS gini_index
    FROM proportion
    GROUP BY userid
    )
    SELECT IFNULL(gini_index, 0)
    INTO new_gini
    FROM gini_table
    WHERE userid = OLD.userid;

    INSERT INTO user_gini_cache (userid, gini_index)
    VALUES (OLD.userid, new_gini)
    ON DUPLICATE KEY UPDATE
      gini_index = VALUES(gini_index);

END$$

DELIMITER ;