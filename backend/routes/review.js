import { verifyToken } from '../middleware/auth.js';

export default async function reviewsRoutes(fastify, options) {
  // Get all reviews for a specific movie
  fastify.get('/reviews/:tconst', async (request, reply) => {
    const { tconst } = request.params;

    try {
      const [rows] = await fastify.mysql.execute(
        `SELECT r.userid, r.content, u.username
         FROM reviews r
         JOIN user u ON r.userid = u.userid
         WHERE r.tconst = ?
         ORDER BY u.username`,
        [tconst]
      );

      return rows;
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch reviews' });
    }
  });

  // Get user's own review for a specific movie
  fastify.get('/reviews/:tconst/my-review', { preHandler: verifyToken }, async (request, reply) => {
    const { tconst } = request.params;

    try {
      const [rows] = await fastify.mysql.execute(
        `SELECT content FROM reviews WHERE tconst = ? AND userid = ?`,
        [tconst, request.user.userid]
      );

      if (rows.length === 0) {
        return reply.code(404).send({ error: 'Review not found' });
      }

      return rows[0];
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch review' });
    }
  });

  // Add or update review (upsert)
  fastify.post('/reviews', { preHandler: verifyToken }, async (request, reply) => {
    const { tconst, content } = request.body;

    if (!tconst || !content) {
      return reply.code(400).send({ error: 'Movie ID and content required' });
    }

    if (content.length > 1024) {
      return reply.code(400).send({ error: 'Review content too long (max 1024 characters)' });
    }

    try {
      // Use INSERT ... ON DUPLICATE KEY UPDATE for upsert behavior
      await fastify.mysql.execute(
        `INSERT INTO reviews (userid, tconst, content) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE content = VALUES(content)`,
        [request.user.userid, tconst, content]
      );

      return { success: true, message: 'Review saved successfully' };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to save review' });
    }
  });

  // Delete review
  fastify.delete('/reviews/:tconst', { preHandler: verifyToken }, async (request, reply) => {
    const { tconst } = request.params;

    try {
      const [result] = await fastify.mysql.execute(
        'DELETE FROM reviews WHERE tconst = ? AND userid = ?',
        [tconst, request.user.userid]
      );

      if (result.affectedRows === 0) {
        return reply.code(404).send({ error: 'Review not found' });
      }

      return { success: true, message: 'Review deleted successfully' };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to delete review' });
    }
  });
}