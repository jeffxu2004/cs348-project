SELECT
    t.primary_title,
    t.average_rating
FROM
    title AS t
ORDER BY
    VEC_DISTANCE_EUCLIDEAN (
        t.embedding,
        VEC_FromText ('[0.3, 0,5, 0.1, 0.3]')
    )
LIMIT
    10;