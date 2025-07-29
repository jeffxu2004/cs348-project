WITH example_embedding AS (
    SELECT Vec_ToText(embedding) FROM title WHERE tconst = 'tt0068646'
)
SELECT 
    tconst,
    primary_title,
    average_rating,
    plot,
    VEC_DISTANCE_COSINE(embedding, Vec_FromText(example_embedding)) AS similarity_score
FROM title t
WHERE embedding IS NOT NULL
AND VEC_DISTANCE_COSINE(embedding, Vec_FromText(example_embedding)) < 0.7
ORDER BY VEC_DISTANCE_COSINE(embedding, Vec_FromText(example_embedding)) ASC
LIMIT 10;

