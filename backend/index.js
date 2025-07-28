import Fastify from "fastify";
import cors from "@fastify/cors";

// Import plugins
import dbConnector from "./plugins/database.js";

// Import routes
import authRoutes from "./routes/auth.js";
import movieRoutes from "./routes/movies.js";
import favoritesRoutes from "./routes/favorites.js";
import searchRoutes from "./routes/search.js";
import peopleRoutes from "./routes/people.js";
import analyticsRoutes from "./routes/analytics.js";
import reviewsRoutes from "./routes/review.js"
import auditRoutes from "./routes/auditlog.js";
const fastify = Fastify({ logger: true });

// Register plugins
await fastify.register(import("@fastify/mysql"), {
    promise: true,
    connectionString: "mysql://admin:pass@localhost/movie_app",
});

// Register session plugin for cookies
await fastify.register(import("@fastify/cookie"), {
    secret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
});

// test env: allow localhost
await fastify.register(cors, {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

// Register routes
await fastify.register(authRoutes);
await fastify.register(movieRoutes);
await fastify.register(favoritesRoutes);
await fastify.register(searchRoutes);
await fastify.register(peopleRoutes);
await fastify.register(analyticsRoutes);
await fastify.register(reviewsRoutes);
await fastify.register(auditRoutes);

fastify.get("/", async function (request, reply) {
    const [rows] = await fastify.mysql.query("SELECT * FROM title LIMIT 5");
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
