CREATE INDEX idx_principal ON principal (tconst, nconst, category);
CREATE INDEX idx_people_nconst ON people (nconst);

CREATE OR REPLACE VIEW shared_principal AS
SELECT
  pr1.tconst,
  pr1.nconst AS nconst1,
  pr2.nconst AS nconst2,
  pr1.category AS category1,
  pr2.category AS category2
FROM principal pr1
JOIN principal pr2 ON pr1.tconst = pr2.tconst
WHERE pr1.nconst != pr2.nconst;