export default async function analyticsRoutes(fastify, options) {
  // Get user's Gini index
  fastify.get('/users/:userid/gini', async (request, reply) => {
    const { userid } = request.params;

    const sql = `
      SELECT userid, gini_index
      FROM user_gini_cache
      WHERE user_gini_cache.userid = ?;
    `;

    try {
      const [rows] = await fastify.mysql.execute(sql, [userid]);

      if (rows.length === 0) {
        return reply.code(404).send({ error: 'User not found or no favorites recorded' });
      }

      return reply.send(rows[0]);
    } catch (err) {
      request.log.error(err);
      return reply.code(500).send({ error: 'Database error while computing gini index' });
    }
  });

  // Get Gini percentile
  fastify.get('/gini-percentile', async (request, reply) => {
    const { value } = request.query;

    if (value === undefined || isNaN(parseFloat(value))) {
      return reply.code(400).send({ error: 'Invalid or missing gini value' });
    }

    const sql = `
      SELECT ROUND(
        100.0 * SUM(CASE WHEN gini_index <= ? THEN 1 ELSE 0 END) / COUNT(*),
        2
      ) AS percentile
      FROM user_gini_cache;
    `;

    try {
      const [rows] = await fastify.mysql.execute(sql, [parseFloat(value)]);
      return reply.send(rows[0]);
    } catch (err) {
      request.log.error(err);
      return reply.code(500).send({ error: 'Failed to compute percentile' });
    }
  });
}
