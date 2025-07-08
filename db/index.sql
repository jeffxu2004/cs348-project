CREATE INDEX idx_numvotes_avgRating ON title (numvotes, average_rating DESC);
CREATE INDEX idx_numvotes_desc ON title (numvotes DESC);
CREATE INDEX idx_releaseYear_numvotes_avgRating_desc ON title (release_year, numvotes, average_rating DESC);
