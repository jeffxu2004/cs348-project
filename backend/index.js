import Fastify from "fastify";
import mysql from "mysql2/promise";

const fastify = Fastify({ logger: true });

(async () => {
    // Create DB connection
    const db = await mysql.createConnection({
        host: "localhost",
        user: "admin",
        password: "pass",
        database: "movie_app",
    });

    // Example route using the DB
    fastify.get("/", async function (request, reply) {
        const [rows] = await db.query("SELECT * FROM titles LIMIT 5");
        reply.send(rows);
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

