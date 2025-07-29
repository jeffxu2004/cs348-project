USE movie_app;

-- Find login based on username (to allow user to login)
SELECT userid, username, password, isAdmin FROM user WHERE username = 'jesus81u88503';

-- Favorite
-- Which movies the user selected as their favorites
INSERT INTO favorites VALUES ("u88503", "tt0167260");

-- view the list of all movies in the user's favorite list
SELECT t.tconst, t.primary_title, t.release_year, t.average_rating 
FROM favorites f
JOIN title t ON f.tconst = t.tconst
WHERE f.userid = 'u88503'
ORDER BY t.primary_title;


DELETE FROM favorites WHERE tconst = 'tt0167260' AND userid = 'u88503';
