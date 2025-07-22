USE movie_app;

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
