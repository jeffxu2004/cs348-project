use movie_app;

ALTER TABLE title ADD COLUMN embedding VECTOR(384);
CREATE VECTOR INDEX movie_vec_index ON title (embedding);
