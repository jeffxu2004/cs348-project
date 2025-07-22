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
           COUNT(DISTINCT pr1.tconst) AS sharedMoviesCount
         FROM principal pr1
         JOIN principal pr2 ON pr1.tconst = pr2.tconst
         JOIN people p ON pr1.nconst = p.nconst
         WHERE pr2.nconst = ?
           AND pr1.nconst != ?
           AND pr1.category IN ('actor', 'actress')
           AND pr2.category IN ('actor', 'actress')
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
           MAX(p1_person.name) AS actor1_name,
           MAX(p2_person.name) AS actor2_name
         FROM principal p1
         JOIN principal p2 ON p1.tconst = p2.tconst
         JOIN title t ON t.tconst = p1.tconst
         JOIN people p1_person ON p1.nconst = p1_person.nconst
         JOIN people p2_person ON p2.nconst = p2_person.nconst
         WHERE p1.nconst = ?
           AND p2.nconst = ?
           AND p1.category IN ('actor', 'actress')
           AND p2.category IN ('actor', 'actresses')
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
