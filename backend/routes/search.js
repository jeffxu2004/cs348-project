import { generateEmbedding } from "../utils/embed.js";

export default async function searchRoutes(fastify, options) {
    // Search API
    fastify.get("/search", async (request, reply) => {
        const { q, searchIn = "title" } = request.query;

        if (!q || q.length < 2) {
            return reply.code(400).send({ error: "Query too short" });
        }

        try {
            let rows;

            if (searchIn === "full") {
                // Full-text search on title and plot
                [rows] = await fastify.mysql.execute(
                    `SELECT 
             tconst,
             primary_title,
             numvotes,
             average_rating,
             plot,
             MATCH(primary_title, plot) AGAINST (? IN NATURAL LANGUAGE MODE) AS relevance
           FROM title
           WHERE MATCH(primary_title, plot) AGAINST (? IN NATURAL LANGUAGE MODE)
           ORDER BY relevance DESC
           LIMIT 20`,
                    [q, q]
                );
            } else {
                // Default: basic LIKE search on title
                [rows] = await fastify.mysql.execute(
                    `SELECT 
             tconst,
             primary_title,
             numvotes,
             average_rating,
             plot
           FROM title
           WHERE primary_title LIKE ?
           LIMIT 20`,
                    [`%${q}%`]
                );
            }

            return rows;
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ error: "Database query failed" });
        }
    });

    // semantic search endpoint
    fastify.get("/search/semantic", async (request, reply) => {
        const { q } = request.query;

        if (!q || q.length < 2) {
            return reply.code(400).send({ error: "Query too short" });
        }

        try {
            const embedding = await generateEmbedding(q);
            const [rows] = await fastify.mysql.execute(
                `SELECT 
                    tconst,
                    primary_title,
                    average_rating,
                    plot,
                    VEC_DISTANCE_COSINE(embedding, Vec_FromText(?)) AS similarity_score
                FROM title t
                WHERE embedding IS NOT NULL
                ORDER BY VEC_DISTANCE_COSINE(embedding, Vec_FromText(?)) ASC
                LIMIT 10`,
                [JSON.stringify(embedding), JSON.stringify(embedding)]
            );

            return rows || [];
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ error: "Semantic search failed" });
        }
    });
}
