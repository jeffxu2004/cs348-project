USE movie_app;
-- Note no changes were made since we are working with the same of toy dataset
-- Adding a new user
INSERT INTO user VALUES ("a11", "uwaterloo_student", "password", FALSE)
-- Which movies the user selected as their favorites
INSERT INTO favorites VALUES ("a11", "tt0468569")


SELECT t.tconst, t.primary_title, t.release_year, t.average_rating 
FROM favorites f
JOIN title t ON f.tconst = t.tconst
WHERE f.userid = 'a11'
ORDER BY t.primary_title