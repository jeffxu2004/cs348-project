USE movie_app;

-- Inserting movies
INSERT INTO title (tconst, primary_title, numvotes, average_rating, runtime, release_year)
VALUES ('tt9999999', 'Example Movie', 0, NULL, 120, 2024);

INSERT INTO genres (tconst, genres) VALUES
('tt9999999', 'Drama'),
('tt9999999', 'Thriller');

-- Deleting movies

DELETE FROM genres WHERE tconst = 'tt9999999';


DELETE FROM principal WHERE tconst = 'tt9999999';
DELETE FROM director WHERE tconst = 'tt9999999';
DELETE FROM writer WHERE tconst = 'tt9999999';
DELETE FROM favorites WHERE tconst = 'tt9999999';

-- Finally delete from title table
DELETE FROM title WHERE tconst = 'tt9999999';

-- Altering movies
-- Update the title table
UPDATE title
SET runtime = 125
WHERE tconst = 'tt0109830';

-- Update genres (delete old genres and insert new ones)
INSERT INTO genres (tconst, genres) VALUES ('tt0137523', 'Action');