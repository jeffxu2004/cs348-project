import Fastify from "fastify";
import mysql from "mysql2/promise";

const fastify = Fastify({ logger: true });
import cors from "@fastify/cors";

(async () => {
    // Create DB connection
    const db = await mysql.createConnection({
        host: "localhost",
        user: "admin",
        password: "pass",
        database: "movie_app",
    });

    // sanity check route
    fastify.get("/", async function (request, reply) {
        const [rows] = await db.query("SELECT * FROM titles LIMIT 5");
        reply.send(rows);
    });

    // test env: allow localhost
    await fastify.register(cors, {
        origin: "http://localhost:5173", 
        credentials: true,
    });

    // search API
    fastify.get("/search", async (request, reply) => {
        const { q } = request.query;

        if (!q || q.length < 2) {
            return reply.code(400).send({ error: "Query too short" });
        }

        try {
            const [rows] = await db.execute(
                "SELECT tid, primaryTitle, startYear FROM titles WHERE primaryTitle LIKE ? LIMIT 20",
                [`%${q}%`]
            );
            return rows;
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ error: "Database query failed" });
        }
    });

    // Start server
    try {
        const address = await fastify.listen({ port: 3000 });
        console.log(`Server listening on ${address}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
})();
