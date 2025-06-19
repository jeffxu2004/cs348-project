CREATE DATABASE IF NOT EXISTS movie_app;
USE movie_app;

-- Drop tables if they exist
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS principal;
DROP TABLE IF EXISTS writer;
DROP TABLE IF EXISTS director;
DROP TABLE IF EXISTS know_for;
DROP TABLE IF EXISTS profession;
DROP TABLE IF EXISTS genres;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS people;
DROP TABLE IF EXISTS title;

-- Create title table
CREATE TABLE title (
  tconst VARCHAR(100) PRIMARY KEY,
  primary_title TEXT,
  numvotes INT,
  average_rating FLOAT,
  runtime INT,
  release_year INT
);

-- Create genres table  
CREATE TABLE genres (
  tconst VARCHAR(100),
  genres VARCHAR(100),
  PRIMARY KEY (tconst, genres),
  FOREIGN KEY (tconst) REFERENCES title(tconst)
);

-- Create people table
CREATE TABLE people (
  nconst VARCHAR(100) PRIMARY KEY,
  name TEXT,
  birthyear INT,
  deathyear INT
);

-- Create profession table
CREATE TABLE profession (
  nconst VARCHAR(100),
  profession VARCHAR(100),
  PRIMARY KEY (nconst, profession),
  FOREIGN KEY (nconst) REFERENCES people(nconst)
);

-- Create know_for table
CREATE TABLE know_for (
  nconst VARCHAR(100),
  title VARCHAR(100),
  PRIMARY KEY (nconst, title),
  FOREIGN KEY (nconst) REFERENCES people(nconst)
);

-- Create director table
CREATE TABLE director (
  nconst VARCHAR(100),
  tconst VARCHAR(100),
  PRIMARY KEY (nconst, tconst),
  FOREIGN KEY (nconst) REFERENCES people(nconst),
  FOREIGN KEY (tconst) REFERENCES title(tconst)
);

-- Create writer table
CREATE TABLE writer (
  nconst VARCHAR(100),
  tconst VARCHAR(100),
  PRIMARY KEY (nconst, tconst),
  FOREIGN KEY (nconst) REFERENCES people(nconst),
  FOREIGN KEY (tconst) REFERENCES title(tconst)
);

-- Create principal table
CREATE TABLE principal (
  nconst VARCHAR(100),
  tconst VARCHAR(100),
  job VARCHAR(100),
  category VARCHAR(100),
  character_name VARCHAR(200),
  PRIMARY KEY (nconst, tconst),
  FOREIGN KEY (nconst) REFERENCES people(nconst),
  FOREIGN KEY (tconst) REFERENCES title(tconst)
);

-- Create user table
CREATE TABLE user (
  userid VARCHAR(100) PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  isAdmin BOOLEAN NOT NULL
);

-- Create favorites table
CREATE TABLE favorites (
  userid VARCHAR(100),
  tconst VARCHAR(100),
  PRIMARY KEY (userid, tconst),
  FOREIGN KEY (userid) REFERENCES user(userid),
  FOREIGN KEY (tconst) REFERENCES title(tconst)
);