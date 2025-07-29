use movie_app;

WITH target_embedding AS (
    SELECT embedding FROM title WHERE tconst = 'tt0068646'
)
SELECT 
    tconst,
    primary_title,
    average_rating,
    plot,
    VEC_DISTANCE_COSINE(embedding, (SELECT embedding FROM target_embedding)) AS similarity_score
FROM title t
WHERE embedding IS NOT NULL
AND VEC_DISTANCE_COSINE(embedding, (SELECT embedding FROM target_embedding)) < 0.7
ORDER BY VEC_DISTANCE_COSINE(embedding, (SELECT embedding FROM target_embedding)) ASC
LIMIT 10;

