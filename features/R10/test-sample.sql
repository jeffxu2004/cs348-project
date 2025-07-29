USE movie_app;

INSERT INTO reviews (userid, tconst, content) VALUES
    ('u1', 'tt0068646', 'this movie rocked! i really enjoyed frame #3193'),
    ('u2', 'tt0068646', 'I would recomend to friends'),
    ('u3', 'tt0068646', 'I do no see the hype.')
ON DUPLICATE KEY UPDATE content = VALUES(content);

SELECT r.userid, r.content, u.username
FROM reviews r
JOIN user u ON r.userid = u.userid
WHERE r.tconst = 'tt0068646'
ORDER BY u.username;


SELECT content FROM reviews WHERE tconst = 'tt0068646' AND userid = 'u1';

DELETE FROM reviews WHERE tconst = 'tt0068646' AND userid = 'u1';
