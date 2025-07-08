USE movie_app;

INSERT INTO
    reviews (userid, tconst, content)
VALUES
    (
        'user0',
        'tt0068646',
        'this movie rocked! i really enjoyed frame #3193'
    );

SELECT
    r.*
FROM
    reviews r,
    users u
WHERE
    r.userid = u.userid;