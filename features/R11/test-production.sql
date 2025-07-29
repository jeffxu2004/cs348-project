USE movie_app;

/* INSERT INTO user_gini_cache(userid, gini_index)
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
    DECLARE remaining_count INT DEFAULT 0;
    
    -- Check if user will have any favorites left after deletion
    SELECT COUNT(*) INTO remaining_count
    FROM favorites
    WHERE userid = OLD.userid AND tconst != OLD.tconst;
    
    IF remaining_count > 0 THEN
        WITH user_genre_count AS (
            SELECT userid, genres.genres AS genres, COUNT(favorites.tconst) AS user_favorite
            FROM favorites
            INNER JOIN genres ON favorites.tconst = genres.tconst
            WHERE favorites.userid = OLD.userid AND favorites.tconst != OLD.tconst
            GROUP BY userid, genres
        ), total_movies AS (
            SELECT userid, COUNT(tconst) AS total_favorite
            FROM favorites
            WHERE favorites.userid = OLD.userid AND favorites.tconst != OLD.tconst
            GROUP BY userid
        ), proportion AS (
            SELECT total_movies.userid AS userid, genres, user_favorite/total_favorite AS user_p
            FROM user_genre_count
            JOIN total_movies ON user_genre_count.userid = total_movies.userid
        ), gini_table AS (
            SELECT userid, -SUM(user_p * LOG2(user_p)) AS gini_index
            FROM proportion
            GROUP BY userid
        )
        SELECT IFNULL(gini_index, 0)
        INTO new_gini
        FROM gini_table
        WHERE userid = OLD.userid;
    ELSE
        SET new_gini = 0;
    END IF;
    
    INSERT INTO user_gini_cache (userid, gini_index)
    VALUES (OLD.userid, new_gini)
    ON DUPLICATE KEY UPDATE gini_index = VALUES(gini_index);
END$$

DELIMITER ; */


SELECT * FROM user_gini_cache WHERE userid = 'u41571';

-- This operation would make the trigger execute to update the diversity score
INSERT INTO favorites(userid, tconst) VALUES
('u41571', 'tt0110912');

SELECT * FROM user_gini_cache WHERE userid = 'u41571';

DELETE FROM favorites
WHERE userid = 'u41571' AND tconst = 'tt0110912';

SELECT * FROM user_gini_cache WHERE userid = 'u41571';
SELECT ROUND(
   100.0 * SUM(CASE WHEN gini_index <= 1.9582 THEN 1 ELSE 0 END) / COUNT(*),
   2
) AS percentile
FROM user_gini_cache;
