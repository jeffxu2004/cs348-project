export default async function searchRoutes(fastify, options) {
  // Search API
  fastify.get('/search', async (request, reply) => {
    const { q, searchIn = 'title' } = request.query;

    if (!q || q.length < 2) {
      return reply.code(400).send({ error: 'Query too short' });
    }

    try {
      let rows;

      if (searchIn === 'full') {
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
      return reply.code(500).send({ error: 'Database query failed' });
    }
  });
}
