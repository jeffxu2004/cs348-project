import { verifyToken } from '../middleware/auth.js';

export default async function favoritesRoutes(fastify, options) {
  // Get user's favorites
  fastify.get('/favorites', { preHandler: verifyToken }, async (request, reply) => {
    try {
      const [rows] = await fastify.mysql.execute(
        `SELECT t.tconst, t.primary_title, t.release_year, t.average_rating
         FROM favorites f
         JOIN title t ON f.tconst = t.tconst
         WHERE f.userid = ?
         ORDER BY t.primary_title`,
        [request.user.userid]
      );

      return rows;
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch favorites' });
    }
  });

  // Add to favorites
  fastify.post('/favorites', { preHandler: verifyToken }, async (request, reply) => {
    const { tconst } = request.body;

    if (!tconst) {
      return reply.code(400).send({ error: 'Movie ID required' });
    }

    try {
      // Check if already in favorites
      const [existing] = await fastify.mysql.execute(
        'SELECT * FROM favorites WHERE tconst = ? AND userid = ?',
        [tconst, request.user.userid]
      );

      if (existing.length > 0) {
        return reply.code(400).send({ error: 'Already in favorites' });
      }

      await fastify.mysql.execute(
        'INSERT INTO favorites (userid, tconst) VALUES (?, ?)',
        [request.user.userid, tconst]
      );

      return { success: true, message: 'Added to favorites' };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to add favorite' });
    }
  });

  // Remove from favorites
  fastify.delete('/favorites/:tconst', { preHandler: verifyToken }, async (request, reply) => {
    const { tconst } = request.params;

    try {
      const [result] = await fastify.mysql.execute(
        'DELETE FROM favorites WHERE tconst = ? AND userid = ?',
        [tconst, request.user.userid]
      );

      if (result.affectedRows === 0) {
        return reply.code(404).send({ error: 'Favorite not found' });
      }

      return { success: true, message: 'Removed from favorites' };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to remove favorite' });
    }
  });
}
