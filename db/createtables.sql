CREATE DATABASE IF NOT EXISTS movie_app;
USE movie_app;

-- Drop tables if they exist
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS casts;
DROP TABLE IF EXISTS people;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS titles;

-- Create titles table
CREATE TABLE titles (
  tid VARCHAR(100) PRIMARY KEY,
  titleType VARCHAR(50),
  primaryTitle TEXT,
  startYear INT,
  genres TEXT
);

-- Create ratings table
CREATE TABLE ratings (
  tid VARCHAR(100) PRIMARY KEY,
  averageRating FLOAT,
  numVotes INT,
  FOREIGN KEY (tid) REFERENCES titles(tid)
);

-- Create people table
CREATE TABLE people (
  pid VARCHAR(100) PRIMARY KEY,
  name TEXT,
  birthYear INT,
  deathYear INT
);

-- Create cast table
CREATE TABLE casts (
  tid VARCHAR(100),
  pid VARCHAR(100),
  role VARCHAR(100),
  PRIMARY KEY (tid, pid),
  FOREIGN KEY (tid) REFERENCES titles(tid),
  FOREIGN KEY (pid) REFERENCES people(pid)
);

-- Create user table
CREATE TABLE users (
  userid VARCHAR(100) PRIMARY KEY,
  username VARCHAR(100),
  password VARCHAR(100)
);

-- Create favorites table
CREATE TABLE favorites (
  tid VARCHAR(100),
  userid VARCHAR(100),
  PRIMARY KEY (tid, userid),
  FOREIGN KEY (tid) REFERENCES titles(tid),
  FOREIGN KEY (userid) REFERENCES users(userid)
);

