import Fastify from "fastify";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const fastify = Fastify({ logger: true });
import cors from "@fastify/cors";

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

(async () => {
    // Create DB connection
    const db = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "password",
        database: "movie_app",
    });

    // JWT verification middleware
    const verifyToken = async (request, reply) => {
        try {
            const token = request.cookies.token
                || request.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return reply.code(401).send({ error: "No token provided" });
            }
            
            const decoded = jwt.verify(token, JWT_SECRET);
            request.user = decoded;
        } catch (err) {
            return reply.code(401).send({ error: "Invalid token" });
        }
    };

    // Register session plugin for cookies
    await fastify.register(import('@fastify/cookie'), {
        secret: JWT_SECRET
    });

    // test env: allow localhost
    await fastify.register(cors, {
        origin: "http://localhost:5173", 
        credentials: true,
    });

    // sanity check route
    fastify.get("/", async function (request, reply) {
        const [rows] = await db.query("SELECT * FROM titles LIMIT 5");
        reply.send(rows);
    });

    // Login endpoint
    fastify.post("/login", async (request, reply) => {
        const { username, password } = request.body;

        if (!username || !password) {
            return reply.code(400).send({ error: "Username and password required" });
        }

        try {
            const [rows] = await db.execute(
                "SELECT userid, username, password, is_admin FROM users WHERE username = ?",
                [username]
            );

            if (rows.length === 0) {
                return reply.code(401).send({ error: "Invalid credentials" });
            }

            const user = rows[0];
            
            // For demo purposes, comparing plain text passwords
            // In production, you should hash passwords with bcrypt
            if (password !== user.password) {
                return reply.code(401).send({ error: "Invalid credentials" });
            }

            // Create JWT token
            const token = jwt.sign(
                { 
                    userid: user.userid, 
                    username: user.username,
                    is_admin: user.is_admin 
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Set HTTP-only cookie
            reply.setCookie('token', token, {
                httpOnly: true,
                secure: false, // set to true in production with HTTPS
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

            return { 
                success: true,
                user: {
                    userid: user.userid,
                    username: user.username,
                    is_admin: user.is_admin
                }
            };
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ error: "Login failed" });
        }
    });

    // Logout endpoint
    fastify.post("/logout", async (request, reply) => {
        reply.clearCookie('token');
        return { success: true, message: "Logged out successfully" };
    });

    // Get current user info
    fastify.get("/me", { preHandler: verifyToken }, async (request, reply) => {
        return { user: request.user };
    });

    // Get user's favorites (protected route)
    fastify.get("/favorites", { preHandler: verifyToken }, async (request, reply) => {
        try {
            const [rows] = await db.execute(`
                SELECT t.tid, t.primaryTitle, t.startYear, r.averageRating 
                FROM favorites f
                JOIN titles t ON f.tid = t.tid
                LEFT JOIN ratings r ON t.tid = r.tid
                WHERE f.userid = ?
                ORDER BY t.primaryTitle
            `, [request.user.userid]);
            
            return rows;
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ error: "Failed to fetch favorites" });
        }
    });

    // Add to favorites (protected route)
    fastify.post("/favorites", { preHandler: verifyToken }, async (request, reply) => {
        const { tid } = request.body;

        if (!tid) {
            return reply.code(400).send({ error: "Movie ID required" });
        }

        try {
            // Check if already in favorites
            const [existing] = await db.execute(
                "SELECT * FROM favorites WHERE tid = ? AND userid = ?",
                [tid, request.user.userid]
            );

            if (existing.length > 0) {
                return reply.code(400).send({ error: "Already in favorites" });
            }

            await db.execute(
                "INSERT INTO favorites (tid, userid) VALUES (?, ?)",
                [tid, request.user.userid]
            );

            return { success: true, message: "Added to favorites" };
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ error: "Failed to add favorite" });
        }
    });

    // Remove from favorites (protected route)
    fastify.delete("/favorites/:tid", { preHandler: verifyToken }, async (request, reply) => {
        const { tid } = request.params;

        try {
            const [result] = await db.execute(
                "DELETE FROM favorites WHERE tid = ? AND userid = ?",
                [tid, request.user.userid]
            );

            if (result.affectedRows === 0) {
                return reply.code(404).send({ error: "Favorite not found" });
            }

            return { success: true, message: "Removed from favorites" };
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ error: "Failed to remove favorite" });
        }
    });

    // search API (keep existing)
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