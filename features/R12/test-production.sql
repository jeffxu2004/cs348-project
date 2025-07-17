USE movie_app;

ALTER TABLE title
  ADD FULLTEXT idx_title_plot (primary_title, plot);
;