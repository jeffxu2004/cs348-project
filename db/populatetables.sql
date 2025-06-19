USE movie_app;

INSERT INTO titles (tid, titleType, primaryTitle, startYear, genres) VALUES
('tt0111161', 'movie', 'The Shawshank Redemption', 1994, 'Drama'),
('tt0068646', 'movie', 'The Godfather', 1972, 'Crime,Drama'),
('tt0468569', 'movie', 'The Dark Knight', 2008, 'Action,Crime,Drama'),
('tt0071562', 'movie', 'The Godfather Part II', 1974, 'Crime,Drama'),
('tt0108052', 'movie', 'Schindler''s List', 1993, 'Biography,Drama'),
('tt0167260', 'movie', 'The Lord of the Rings: The Return of the King', 2003, 'Action,Adventure,Drama'),
('tt0110912', 'movie', 'Pulp Fiction', 1994, 'Crime,Drama'),
('tt0137523', 'movie', 'Fight Club', 1999, 'Drama'),
('tt0120737', 'movie', 'The Lord of the Rings: The Fellowship of the Ring', 2001, 'Adventure,Drama,Fantasy'),
('tt0109830', 'movie', 'Forrest Gump', 1994, 'Drama,Romance');

INSERT INTO ratings (tid, averageRating, numVotes) VALUES
('tt0111161', 9.3, 2700000),
('tt0068646', 9.2, 1900000),
('tt0468569', 9.0, 2600000),
('tt0071562', 9.0, 1300000),
('tt0108052', 8.9, 1400000),
('tt0167260', 8.9, 1900000),
('tt0110912', 8.9, 2000000),
('tt0137523', 8.8, 1900000),
('tt0120737', 8.8, 1800000),
('tt0109830', 8.8, 2100000);

INSERT INTO people (pid, name, birthYear, deathYear) VALUES
-- Shawshank Redemption
('nm0000209', 'Morgan Freeman', 1937, NULL),
('nm0000151', 'Tim Robbins', 1958, NULL),
('nm0348409', 'Bob Gunton', 1945, NULL),

-- The Godfather
('nm0000199', 'Marlon Brando', 1924, 2004),
('nm0000197', 'Al Pacino', 1940, NULL),
('nm0001001', 'James Caan', 1940, 2022),

-- The Dark Knight
('nm0000288', 'Christian Bale', 1974, NULL),
('nm0005132', 'Heath Ledger', 1979, 2008),
('nm0001173', 'Aaron Eckhart', 1968, NULL),

-- The Godfather Part II
-- ('nm0000199', 'Marlon Brando', 1924, 2004),
-- ('nm0000197', 'Al Pacino', 1940, NULL),
('nm0000134', 'Robert De Niro', 1943, NULL),

-- Schindler's List
('nm0000553', 'Liam Neeson', 1952, NULL),
('nm0000146', 'Ben Kingsley', 1943, NULL),
('nm0000164', 'Ralph Fiennes', 1962, NULL),

-- The Return of the King
-- ('nm0000704', 'Elijah Wood', 1981, NULL),
('nm0001557', 'Viggo Mortensen', 1958, NULL),
-- ('nm0005212', 'Ian McKellen', 1939, NULL),

-- Pulp Fiction
('nm0000237', 'John Travolta', 1954, NULL),
('nm0000235', 'Samuel L. Jackson', 1948, NULL),
('nm0000236', 'Uma Thurman', 1970, NULL),

-- Fight Club
('nm0000093', 'Brad Pitt', 1963, NULL),
('nm0001570', 'Edward Norton', 1969, NULL),
('nm0000260', 'Helena Bonham Carter', 1966, NULL),

-- Fellowship of the Ring
('nm0000704', 'Elijah Wood', 1981, NULL),
('nm0005212', 'Ian McKellen', 1939, NULL),
('nm0089217', 'Orlando Bloom', 1977, NULL),

-- Forrest Gump
('nm0000158', 'Tom Hanks', 1956, NULL),
('nm0000705', 'Robin Wright', 1966, NULL),
('nm0000641', 'Gary Sinise', 1955, NULL);

INSERT INTO casts (tid, pid, role) VALUES
-- The Shawshank Redemption
('tt0111161', 'nm0000209', 'Red'),
('tt0111161', 'nm0000151', 'Andy Dufresne'),
('tt0111161', 'nm0348409', 'Warden Norton'),

-- The Godfather
('tt0068646', 'nm0000199', 'Vito Corleone'),
('tt0068646', 'nm0000197', 'Michael Corleone'),
('tt0068646', 'nm0001001', 'Sonny Corleone'),

-- The Dark Knight
('tt0468569', 'nm0000288', 'Bruce Wayne / Batman'),
('tt0468569', 'nm0005132', 'Joker'),
('tt0468569', 'nm0001173', 'Harvey Dent'),

-- The Godfather Part II
('tt0071562', 'nm0000197', 'Michael Corleone'),
('tt0071562', 'nm0000199', 'Vito Corleone'),
('tt0071562', 'nm0000134', 'Young Vito'),

-- Schindler's List
('tt0108052', 'nm0000553', 'Oskar Schindler'),
('tt0108052', 'nm0000146', 'Itzhak Stern'),
('tt0108052', 'nm0000164', 'Amon Goeth'),

-- Return of the King
('tt0167260', 'nm0000704', 'Frodo Baggins'),
('tt0167260', 'nm0001557', 'Aragorn'),
('tt0167260', 'nm0005212', 'Gandalf'),

-- Pulp Fiction
('tt0110912', 'nm0000237', 'Vincent Vega'),
('tt0110912', 'nm0000235', 'Jules Winnfield'),
('tt0110912', 'nm0000236', 'Mia Wallace'),

-- Fight Club
('tt0137523', 'nm0000093', 'Tyler Durden'),
('tt0137523', 'nm0001570', 'The Narrator'),
('tt0137523', 'nm0000260', 'Marla Singer'),

-- Fellowship of the Ring
('tt0120737', 'nm0000704', 'Frodo Baggins'),
('tt0120737', 'nm0005212', 'Gandalf'),
('tt0120737', 'nm0089217', 'Legolas'),

-- Forrest Gump
('tt0109830', 'nm0000158', 'Forrest Gump'),
('tt0109830', 'nm0000705', 'Jenny Curran'),
('tt0109830', 'nm0000641', 'Lieutenant Dan');


-- Insert Users
INSERT INTO users (userid, username, password, is_admin) VALUES
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
INSERT INTO favorites (tid, userid) VALUES
('tt0111161', 'u1'),
('tt0068646', 'u1'),


('tt0468569', 'u2'),
('tt0110912', 'u2'), 


('tt0071562', 'u3'), 
('tt0108052', 'u3'), 
('tt0111161', 'u3'),


('tt0167260', 'u4'), 
('tt0120737', 'u4'),


('tt0109830', 'u5'),
('tt0137523', 'u5'), 


('tt0068646', 'u6'), 
('tt0108052', 'u6'),


('tt0110912', 'u7'),
('tt0468569', 'u7'),


('tt0071562', 'u8'),
('tt0111161', 'u8'),


('tt0137523', 'u9'),
('tt0120737', 'u9'),


('tt0167260', 'u10'),
('tt0109830', 'u10');


