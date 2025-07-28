export default async function peopleRoutes(fastify, options) {
  // Get person details
  fastify.get('/people/:nconst', async (request, reply) => {
    const { nconst } = request.params;

    try {
      // Get actor basic info
      const [actorRows] = await fastify.mysql.execute(
        'SELECT * FROM people WHERE nconst = ?',
        [nconst]
      );
      
      if (actorRows.length === 0) {
        return reply.code(404).send({ error: 'Actor not found' });
      }
      const actor = actorRows[0];

      // Get co-actors with count of shared unique movies in a single query
      const [coActorsRows] = await fastify.mysql.execute(
        `SELECT 
          p.nconst, 
          p.name, 
          COUNT(DISTINCT sp.tconst) AS sharedMoviesCount
        FROM shared_principal sp
        JOIN people p ON sp.nconst1 = p.nconst
        WHERE sp.nconst2 = ?
          AND sp.nconst1 != ?
          AND sp.category1 IN ('actor', 'actress')
          AND sp.category2 IN ('actor', 'actress')
        GROUP BY p.nconst, p.name
        ORDER BY sharedMoviesCount DESC, p.name
        LIMIT 20`,
        [nconst, nconst]
      );

      return { actor, coActors: coActorsRows };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch actor details' });
    }
  });

  // Shared movies for query above
  fastify.get('/shared-movies/:actor1/:actor2', async (request, reply) => {
    const { actor1, actor2 } = request.params;

    try {
      const [rows] = await fastify.mysql.execute(
        `SELECT DISTINCT
          t.tconst,
          t.primary_title,
          t.release_year,
          MAX(p1.name) AS actor1_name,
          MAX(p2.name) AS actor2_name
        FROM shared_principal sp
        JOIN title t ON t.tconst = sp.tconst
        JOIN people p1 ON sp.nconst1 = p1.nconst
        JOIN people p2 ON sp.nconst2 = p2.nconst
        WHERE sp.nconst1 = ?
          AND sp.nconst2 = ?
          AND sp.category1 IN ('actor', 'actress')
          AND sp.category2 IN ('actor', 'actress')
        GROUP BY t.tconst, t.primary_title, t.release_year
        ORDER BY t.primary_title`,
        [actor1, actor2]
      );

      return { sharedMovies: rows };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch shared movies' });
    }
  });
}
