USE movie_app;

DROP INDEX IF EXISTS idx_title_plot ON title;
ALTER TABLE title
  ADD FULLTEXT idx_title_plot (primary_title, plot);
;