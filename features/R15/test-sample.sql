USE movie_app;

DROP TRIGGER IF EXISTS trg_title_insert;
DROP TRIGGER IF EXISTS trg_title_update;
DROP TRIGGER IF EXISTS trg_title_delete;


DELIMITER //

CREATE TRIGGER trg_title_insert AFTER INSERT ON title
FOR EACH ROW
BEGIN
  INSERT INTO admin_audit_log (admin_id, action_type, tconst, description)
  VALUES (
    IFNULL(@current_admin_id, 'unknown'),
    'INSERT',
    NEW.tconst,
    CONCAT('Inserted movie ', NEW.primary_title)
  );
END;
//

CREATE TRIGGER trg_title_update AFTER UPDATE ON title
FOR EACH ROW
BEGIN
  INSERT INTO admin_audit_log (admin_id, action_type, tconst, description)
  VALUES (
    IFNULL(@current_admin_id, 'unknown'),
    'UPDATE',
    NEW.tconst,
    CONCAT('Updated movie ', NEW.primary_title)
  );
END;
//

CREATE TRIGGER trg_title_delete AFTER DELETE ON title
FOR EACH ROW
BEGIN
  INSERT INTO admin_audit_log (admin_id, action_type, tconst, description)
  VALUES (
    IFNULL(@current_admin_id, 'unknown'),
    'DELETE',
    OLD.tconst,
    CONCAT('Deleted movie ', OLD.primary_title)
  );
END;
//

DELIMITER ;

DELETE
FROM admin_audit_log;

DELETE
FROM title
WHERE tconst = 'tt0000000';
SET @current_admin_id ='a1';

INSERT INTO title (tconst, primary_title, numvotes, average_rating, runtime, release_year, plot) VALUES
('tt0000000', 'Test movie', 2700000, 9.3, 142, 1994, 'Two imprisoned men bond over life');


UPDATE title
SET numvotes = 10, runtime = 100, release_year= 2002
WHERE tconst = 'tt0000000';

SELECT *
FROM title
WHERE tconst = 'tt0000000';

DELETE
FROM title
WHERE tconst = 'tt0000000';


SELECT a.*, u.username 
FROM admin_audit_log a
JOIN user u ON a.admin_id = u.userid
ORDER BY a.action_time DESC
LIMIT 100
;