import { verifyToken } from "../middleware/auth.js";
export default async function auditRoutes(fastify, options) {
    fastify.get(
        "/admin/audit-log",
        { preHandler: verifyToken },
        async (req, reply) => {
            if (!req.user.isAdmin) {
                return reply.code(403).send({ error: "Admin access required" });
            }

            try {
                const [rows] = await fastify.mysql.query(`
      SELECT a.*, u.username 
      FROM admin_audit_log a
      JOIN user u ON a.admin_id = u.userid
      ORDER BY a.action_time DESC
      LIMIT 100
    `);
                return rows;
            } catch (err) {
                req.log.error(err);
                return reply
                    .code(500)
                    .send({ error: "Failed to load audit log" });
            }
        }
    );
}
