USE movie_app;

-- Insert into title table
INSERT INTO title (tconst, primary_title, numvotes, average_rating, runtime, release_year) VALUES
('tt0111161', 'The Shawshank Redemption', 2700000, 9.3, 142, 1994),
('tt0068646', 'The Godfather', 1900000, 9.2, 175, 1972),
('tt0468569', 'The Dark Knight', 2600000, 9.0, 152, 2008),
('tt0071562', 'The Godfather Part II', 1300000, 9.0, 202, 1974),
('tt0108052', 'Schindler''s List', 1400000, 8.9, 195, 1993),
('tt0167260', 'The Lord of the Rings: The Return of the King', 1900000, 8.9, 201, 2003),
('tt0110912', 'Pulp Fiction', 2000000, 8.9, 154, 1994),
('tt0137523', 'Fight Club', 1900000, 8.8, 139, 1999),
('tt0120737', 'The Lord of the Rings: The Fellowship of the Ring', 1800000, 8.8, 178, 2001),
('tt0109830', 'Forrest Gump', 2100000, 8.8, 142, 1994);

-- Insert into genres table
INSERT INTO genres (tconst, genres) VALUES
('tt0111161', 'Drama'),
('tt0068646', 'Crime'),
('tt0068646', 'Drama'),
('tt0468569', 'Action'),
('tt0468569', 'Crime'),
('tt0468569', 'Drama'),
('tt0071562', 'Crime'),
('tt0071562', 'Drama'),
('tt0108052', 'Biography'),
('tt0108052', 'Drama'),
('tt0167260', 'Action'),
('tt0167260', 'Adventure'),
('tt0167260', 'Drama'),
('tt0110912', 'Crime'),
('tt0110912', 'Drama'),
('tt0137523', 'Drama'),
('tt0120737', 'Adventure'),
('tt0120737', 'Drama'),
('tt0120737', 'Fantasy'),
('tt0109830', 'Drama'),
('tt0109830', 'Romance');

-- Insert into people table
INSERT INTO people (nconst, name, birthyear, deathyear) VALUES
-- Shawshank Redemption
('nm0000209', 'Morgan Freeman', 1937, NULL),
('nm0000151', 'Tim Robbins', 1958, NULL),
('nm0348409', 'Bob Gunton', 1945, NULL),
('nm0001104', 'Frank Darabont', 1959, NULL), -- Director

-- The Godfather
('nm0000199', 'Marlon Brando', 1924, 2004),
('nm0000197', 'Al Pacino', 1940, NULL),
('nm0001001', 'James Caan', 1940, 2022),
('nm0000338', 'Francis Ford Coppola', 1939, NULL), -- Director

-- The Dark Knight
('nm0000288', 'Christian Bale', 1974, NULL),
('nm0005132', 'Heath Ledger', 1979, 2008),
('nm0001173', 'Aaron Eckhart', 1968, NULL),
('nm0634240', 'Christopher Nolan', 1970, NULL), -- Director

-- The Godfather Part II
('nm0000134', 'Robert De Niro', 1943, NULL),

-- Schindler's List
('nm0000553', 'Liam Neeson', 1952, NULL),
('nm0000146', 'Ben Kingsley', 1943, NULL),
('nm0000164', 'Ralph Fiennes', 1962, NULL),
('nm0000229', 'Steven Spielberg', 1946, NULL), -- Director

-- The Return of the King
('nm0001557', 'Viggo Mortensen', 1958, NULL),
('nm0001392', 'Peter Jackson', 1961, NULL), -- Director

-- Pulp Fiction
('nm0000237', 'John Travolta', 1954, NULL),
('nm0000235', 'Samuel L. Jackson', 1948, NULL),
('nm0000236', 'Uma Thurman', 1970, NULL),
('nm0000233', 'Quentin Tarantino', 1963, NULL), -- Director

-- Fight Club
('nm0000093', 'Brad Pitt', 1963, NULL),
('nm0001570', 'Edward Norton', 1969, NULL),
('nm0000260', 'Helena Bonham Carter', 1966, NULL),
('nm0000399', 'David Fincher', 1962, NULL), -- Director

-- Fellowship of the Ring
('nm0000704', 'Elijah Wood', 1981, NULL),
('nm0005212', 'Ian McKellen', 1939, NULL),
('nm0089217', 'Orlando Bloom', 1977, NULL),

-- Forrest Gump
('nm0000158', 'Tom Hanks', 1956, NULL),
('nm0000705', 'Robin Wright', 1966, NULL),
('nm0000641', 'Gary Sinise', 1955, NULL),
('nm0000709', 'Robert Zemeckis', 1951, NULL); -- Director

-- Insert into profession table
INSERT INTO profession (nconst, profession) VALUES
-- Actors
('nm0000209', 'actor'),
('nm0000151', 'actor'),
('nm0348409', 'actor'),
('nm0000199', 'actor'),
('nm0000197', 'actor'),
('nm0001001', 'actor'),
('nm0000288', 'actor'),
('nm0005132', 'actor'),
('nm0001173', 'actor'),
('nm0000134', 'actor'),
('nm0000553', 'actor'),
('nm0000146', 'actor'),
('nm0000164', 'actor'),
('nm0001557', 'actor'),
('nm0000237', 'actor'),
('nm0000235', 'actor'),
('nm0000236', 'actress'),
('nm0000093', 'actor'),
('nm0001570', 'actor'),
('nm0000260', 'actress'),
('nm0000704', 'actor'),
('nm0005212', 'actor'),
('nm0089217', 'actor'),
('nm0000158', 'actor'),
('nm0000705', 'actress'),
('nm0000641', 'actor'),

-- Directors
('nm0001104', 'director'),
('nm0000338', 'director'),
('nm0634240', 'director'),
('nm0000229', 'director'),
('nm0001392', 'director'),
('nm0000233', 'director'),
('nm0000399', 'director'),
('nm0000709', 'director'),

-- Some additional professions
('nm0000338', 'writer'),
('nm0634240', 'writer'),
('nm0000233', 'writer'),
('nm0000229', 'producer');

-- Insert into know_for table (linking people to their famous works)
INSERT INTO know_for (nconst, title) VALUES
('nm0000209', 'The Shawshank Redemption'),
('nm0000151', 'The Shawshank Redemption'),
('nm0000199', 'The Godfather'),
('nm0000197', 'The Godfather'),
('nm0000288', 'The Dark Knight'),
('nm0005132', 'The Dark Knight'),
('nm0000134', 'The Godfather Part II'),
('nm0000553', 'Schindler''s List'),
('nm0001557', 'The Lord of the Rings: The Return of the King'),
('nm0000237', 'Pulp Fiction'),
('nm0000235', 'Pulp Fiction'),
('nm0000093', 'Fight Club'),
('nm0001570', 'Fight Club'),
('nm0000704', 'The Lord of the Rings: The Fellowship of the Ring'),
('nm0000158', 'Forrest Gump');

-- Insert into director table
INSERT INTO director (nconst, tconst) VALUES
('nm0001104', 'tt0111161'), -- Frank Darabont - The Shawshank Redemption
('nm0000338', 'tt0068646'), -- Francis Ford Coppola - The Godfather
('nm0634240', 'tt0468569'), -- Christopher Nolan - The Dark Knight
('nm0000338', 'tt0071562'), -- Francis Ford Coppola - The Godfather Part II
('nm0000229', 'tt0108052'), -- Steven Spielberg - Schindler's List
('nm0001392', 'tt0167260'), -- Peter Jackson - The Return of the King
('nm0000233', 'tt0110912'), -- Quentin Tarantino - Pulp Fiction
('nm0000399', 'tt0137523'), -- David Fincher - Fight Club
('nm0001392', 'tt0120737'), -- Peter Jackson - Fellowship of the Ring
('nm0000709', 'tt0109830'); -- Robert Zemeckis - Forrest Gump

-- Insert into writer table
INSERT INTO writer (nconst, tconst) VALUES
('nm0001104', 'tt0111161'), -- Frank Darabont - The Shawshank Redemption
('nm0000338', 'tt0068646'), -- Francis Ford Coppola - The Godfather
('nm0634240', 'tt0468569'), -- Christopher Nolan - The Dark Knight
('nm0000338', 'tt0071562'), -- Francis Ford Coppola - The Godfather Part II
('nm0000229', 'tt0108052'), -- Steven Spielberg - Schindler's List
('nm0001392', 'tt0167260'), -- Peter Jackson - The Return of the King
('nm0000233', 'tt0110912'), -- Quentin Tarantino - Pulp Fiction
('nm0000399', 'tt0137523'), -- David Fincher - Fight Club
('nm0001392', 'tt0120737'), -- Peter Jackson - Fellowship of the Ring
('nm0000709', 'tt0109830'); -- Robert Zemeckis - Forrest Gump

-- Insert into principal table (main cast)
INSERT INTO principal (nconst, tconst, job, category, character_name) VALUES
-- The Shawshank Redemption
('nm0000209', 'tt0111161', 'actor', 'actor', 'Red'),
('nm0000151', 'tt0111161', 'actor', 'actor', 'Andy Dufresne'),
('nm0348409', 'tt0111161', 'actor', 'actor', 'Warden Norton'),

-- The Godfather
('nm0000199', 'tt0068646', 'actor', 'actor', 'Vito Corleone'),
('nm0000197', 'tt0068646', 'actor', 'actor', 'Michael Corleone'),
('nm0001001', 'tt0068646', 'actor', 'actor', 'Sonny Corleone'),

-- The Dark Knight
('nm0000288', 'tt0468569', 'actor', 'actor', 'Bruce Wayne / Batman'),
('nm0005132', 'tt0468569', 'actor', 'actor', 'Joker'),
('nm0001173', 'tt0468569', 'actor', 'actor', 'Harvey Dent'),

-- The Godfather Part II
('nm0000197', 'tt0071562', 'actor', 'actor', 'Michael Corleone'),
('nm0000199', 'tt0071562', 'actor', 'actor', 'Vito Corleone'),
('nm0000134', 'tt0071562', 'actor', 'actor', 'Young Vito'),

-- Schindler's List
('nm0000553', 'tt0108052', 'actor', 'actor', 'Oskar Schindler'),
('nm0000146', 'tt0108052', 'actor', 'actor', 'Itzhak Stern'),
('nm0000164', 'tt0108052', 'actor', 'actor', 'Amon Goeth'),

-- Return of the King
('nm0000704', 'tt0167260', 'actor', 'actor', 'Frodo Baggins'),
('nm0001557', 'tt0167260', 'actor', 'actor', 'Aragorn'),
('nm0005212', 'tt0167260', 'actor', 'actor', 'Gandalf'),

-- Pulp Fiction
('nm0000237', 'tt0110912', 'actor', 'actor', 'Vincent Vega'),
('nm0000235', 'tt0110912', 'actor', 'actor', 'Jules Winnfield'),
('nm0000236', 'tt0110912', 'actress', 'actress', 'Mia Wallace'),

-- Fight Club
('nm0000093', 'tt0137523', 'actor', 'actor', 'Tyler Durden'),
('nm0001570', 'tt0137523', 'actor', 'actor', 'The Narrator'),
('nm0000260', 'tt0137523', 'actress', 'actress', 'Marla Singer'),

-- Fellowship of the Ring
('nm0000704', 'tt0120737', 'actor', 'actor', 'Frodo Baggins'),
('nm0005212', 'tt0120737', 'actor', 'actor', 'Gandalf'),
('nm0089217', 'tt0120737', 'actor', 'actor', 'Legolas'),

-- Forrest Gump
('nm0000158', 'tt0109830', 'actor', 'actor', 'Forrest Gump'),
('nm0000705', 'tt0109830', 'actress', 'actress', 'Jenny Curran'),
('nm0000641', 'tt0109830', 'actor', 'actor', 'Lieutenant Dan');

-- Insert Users
INSERT INTO user (userid, username, password, isAdmin) VALUES
('u1', 'alice', 'passAlice123', FALSE),
('u2', 'bob', 'secureBob456', FALSE),
('u3', 'charlie', 'charlie789', FALSE),
('u4', 'diana', 'dianaPwd321', FALSE),
('u5', 'eric', 'ericSecure456', FALSE),
('u6', 'fiona', 'fionaPwd999', FALSE),
('u7', 'george', 'george1234', FALSE),
('u8', 'hannah', 'hannahPass1', FALSE),
('u9', 'ian', 'ianSecret2', FALSE),
('u10', 'julia', 'juliaLoveMovies', FALSE),
('a1', 'admin', 'admin', TRUE);

-- Insert Favorites (at least 2 per user)
INSERT INTO favorites (userid, tconst) VALUES
('u1', 'tt0111161'),
('u1', 'tt0068646'),

('u2', 'tt0468569'),
('u2', 'tt0110912'), 

('u3', 'tt0071562'), 
('u3', 'tt0108052'), 
('u3', 'tt0111161'),

('u4', 'tt0167260'), 
('u4', 'tt0120737'),

('u5', 'tt0109830'),
('u5', 'tt0137523'), 

('u6', 'tt0068646'), 
('u6', 'tt0108052'),

('u7', 'tt0110912'),
('u7', 'tt0468569'),

('u8', 'tt0071562'),
('u8', 'tt0111161'),

('u9', 'tt0137523'),
('u9', 'tt0120737'),

('u10', 'tt0167260'),
('u10', 'tt0109830');