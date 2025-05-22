CREATE TABLE movies (
    imdb_id VARCHAR(20) NOT NULL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(255),
    year INT,
    rating DECIMAL(3,1)
);
