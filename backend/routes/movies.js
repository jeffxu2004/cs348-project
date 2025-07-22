import { verifyToken } from "../middleware/auth.js";

export default async function movieRoutes(fastify, options) {
    // Insert new movie (admin only)
    fastify.post(
        "/movies",
        { preHandler: verifyToken },
        async (request, reply) => {
            if (!request.user.isAdmin) {
                return reply.code(403).send({ error: "Admin access required" });
            }

            const {
                tconst,
                primary_title,
                release_year,
                runtime,
                average_rating = 0,
                numvotes = 0,
                genres = [],
                directors = [],
                writers = [],
            } = request.body;

            if (!tconst || !primary_title) {
                return reply
                    .code(400)
                    .send({ error: "tconst and primary_title are required" });
            }

            try {
                const [existing] = await fastify.mysql.execute(
                    "SELECT tconst FROM title WHERE tconst = ?",
                    [tconst]
                );

                if (existing.length > 0) {
                    return reply
                        .code(400)
                        .send({ error: "Movie already exists" });
                }

                await fastify.mysql.execute("SET @current_admin_id = ?", [request.user.userid]);

                await fastify.mysql.execute(
                    "INSERT INTO title (tconst, primary_title, release_year, runtime, average_rating, numvotes) VALUES (?, ?, ?, ?, ?, ?)",
                    [
                        tconst,
                        primary_title,
                        release_year,
                        runtime,
                        average_rating,
                        numvotes,
                    ]
                );

                for (const genre of genres) {
                    await fastify.mysql.execute(
                        "INSERT INTO genres (tconst, genres) VALUES (?, ?)",
                        [tconst, genre]
                    );
                }

                // Insert directors
                for (const directorNconst of directors) {
                    await fastify.mysql.execute(
                        "INSERT INTO director (tconst, nconst) VALUES (?, ?)",
                        [tconst, directorNconst]
                    );
                }

                // Insert writers
                for (const writerNconst of writers) {
                    await fastify.mysql.execute(
                        "INSERT INTO writer (tconst, nconst) VALUES (?, ?)",
                        [tconst, writerNconst]
                    );
                }

                return {
                    success: true,
                    message: "Movie added successfully",
                    tconst,
                };
            } catch (err) {
                fastify.log.error(err);
                return reply.code(500).send({ error: "Failed to add movie" });
            }
        }
    );

    // Delete movie (admin only)
    fastify.delete(
        "/movies/:tconst",
        { preHandler: verifyToken },
        async (request, reply) => {
            if (!request.user.isAdmin) {
                return reply.code(403).send({ error: "Admin access required" });
            }

            const { tconst } = request.params;

            try {
                const [existing] = await fastify.mysql.execute(
                    "SELECT tconst FROM title WHERE tconst = ?",
                    [tconst]
                );

                if (existing.length === 0) {
                    return reply.code(404).send({ error: "Movie not found" });
                }

                // Delete related records first
                await fastify.mysql.execute(
                    "DELETE FROM favorites WHERE tconst = ?",
                    [tconst]
                );
                await fastify.mysql.execute(
                    "DELETE FROM genres WHERE tconst = ?",
                    [tconst]
                );
                await fastify.mysql.execute(
                    "DELETE FROM director WHERE tconst = ?",
                    [tconst]
                );
                await fastify.mysql.execute(
                    "DELETE FROM writer WHERE tconst = ?",
                    [tconst]
                );
                await fastify.mysql.execute(
                    "DELETE FROM principal WHERE tconst = ?",
                    [tconst]
                );

                // Finally delete the movie
                await fastify.mysql.execute("SET @current_admin_id = ?", [request.user.userid]);
                const [result] = await fastify.mysql.execute(
                    "DELETE FROM title WHERE tconst = ?",
                    [tconst]
                );

                if (result.affectedRows === 0) {
                    return reply.code(404).send({ error: "Movie not found" });
                }

                return { success: true, message: "Movie deleted successfully" };
            } catch (err) {
                fastify.log.error(err);
                return reply
                    .code(500)
                    .send({ error: "Failed to delete movie" });
            }
        }
    );

    // Get movie details with cast and crew
    fastify.get("/movie/:tconst", async (request, reply) => {
        const { tconst } = request.params;

        try {
            // Get movie basic info
            const [movieRows] = await fastify.mysql.execute(
                "SELECT * FROM title WHERE tconst = ?",
                [tconst]
            );

            if (movieRows.length === 0) {
                return reply.code(404).send({ error: "Movie not found" });
            }

            const movie = movieRows[0];

            // Get genres
            const [genreRows] = await fastify.mysql.execute(
                "SELECT genres FROM genres WHERE tconst = ?",
                [tconst]
            );

            // Get directors
            const [directorRows] = await fastify.mysql.execute(
                `SELECT p.name 
         FROM director d 
         JOIN people p ON d.nconst = p.nconst 
         WHERE d.tconst = ?`,
                [tconst]
            );

            // Get writers
            const [writerRows] = await fastify.mysql.execute(
                `SELECT p.name 
         FROM writer w 
         JOIN people p ON w.nconst = p.nconst 
         WHERE w.tconst = ?`,
                [tconst]
            );

            // Get cast
            const [castRows] = await fastify.mysql.execute(
                `SELECT DISTINCT p.nconst, p.name, pr.character_name
         FROM principal pr
         JOIN people p ON pr.nconst = p.nconst
         WHERE pr.tconst = ? AND pr.category IN ('actor', 'actress')`,
                [tconst]
            );

            return {
                ...movie,
                genres: genreRows.map((g) => g.genres),
                directors: directorRows.map((d) => d.name),
                writers: writerRows.map((w) => w.name),
                cast: castRows.map((p) => ({
                    nconst: p.nconst,
                    name: p.name,
                    character: (() => {
                        try {
                            const parsed = JSON.parse(p.character_name);
                            return Array.isArray(parsed)
                                ? parsed.join(", ")
                                : parsed;
                        } catch {
                            return p.character_name;
                        }
                    })(),
                })),
            };
        } catch (err) {
            fastify.log.error(err);
            return reply
                .code(500)
                .send({ error: "Failed to fetch movie details" });
        }
    });

    // Get movies with detailed info
    fastify.get("/movies/:tconst", async (request, reply) => {
        const { tconst } = request.params;

        try {
            const [rows] = await fastify.mysql.query(
                `SELECT
           t.tconst,
           t.primary_title,
           t.numvotes,
           t.average_rating,
           t.runtime,
           t.release_year,
           GROUP_CONCAT(DISTINCT pd.name SEPARATOR ', ') AS directors,
           GROUP_CONCAT(DISTINCT pw.name SEPARATOR ', ') AS writers,
           GROUP_CONCAT(DISTINCT g.genres SEPARATOR ', ') AS genres
         FROM title AS t
         LEFT JOIN director AS d ON t.tconst = d.tconst
         LEFT JOIN people AS pd ON d.nconst = pd.nconst
         LEFT JOIN writer AS w ON t.tconst = w.tconst
         LEFT JOIN people AS pw ON w.nconst = pw.nconst
         LEFT JOIN genres AS g ON t.tconst = g.tconst
         WHERE t.tconst = ?
         GROUP BY t.tconst, t.primary_title, t.numvotes, t.runtime, t.release_year`,
                [tconst]
            );

            if (rows.length === 0) {
                return reply.code(404).send({ error: "Movie not found" });
            }

            return rows[0];
        } catch (err) {
            request.log.error(err);
            return reply.code(500).send({ error: "Server error" });
        }
    });

    // Update movie (admin only)
    fastify.put(
        "/movies/:tconst",
        { preHandler: verifyToken },
        async (request, reply) => {
            const { tconst } = request.params;
            const {
                primary_title,
                average_rating,
                release_year,
                runtime,
                numvotes,
            } = request.body;

            // Optional: Restrict to admin users
            if (!request.user.isAdmin) {
                return reply.code(403).send({ error: "Admin access required" });
            }

            try {
                await fastify.mysql.execute("SET @current_admin_id = ?", [request.user.userid]);
                const [result] = await fastify.mysql.execute(
                    `UPDATE title 
         SET primary_title = ?, average_rating = ?, release_year = ?, runtime = ?, numvotes = ?
         WHERE tconst = ?`,
                    [
                        primary_title,
                        average_rating,
                        release_year,
                        runtime,
                        numvotes,
                        tconst,
                    ]
                );

                if (result.affectedRows === 0) {
                    return reply
                        .code(404)
                        .send({ error: "Movie not found or no changes made" });
                }

                return { success: true, message: "Movie updated successfully" };
            } catch (err) {
                request.log.error(err);
                return reply
                    .code(500)
                    .send({ error: "Failed to update movie" });
            }
        }
    );

    // Movie list endpoints
    fastify.get("/movies/top-rated", async (req, reply) => {
        const [rows] = await fastify.mysql.query(`
      SELECT primary_title, release_year, average_rating, numvotes, tconst, runtime
      FROM title
      WHERE numvotes > 10000
      ORDER BY average_rating DESC, numvotes DESC
      LIMIT 100;
    `);
        return rows;
    });

    fastify.get("/movies/most-popular", async (req, reply) => {
        const [rows] = await fastify.mysql.query(`
      SELECT primary_title, release_year, average_rating, numvotes, tconst, runtime
      FROM title
      ORDER BY numvotes DESC
      LIMIT 100;
    `);
        return rows;
    });

    fastify.get("/movies/best-of-year", async (req, reply) => {
        const currentYear = new Date().getFullYear();
        const [rows] = await fastify.mysql.query(
            `SELECT primary_title, release_year, average_rating, numvotes, tconst, runtime
       FROM title
       WHERE release_year = ? AND numvotes > 5000
       ORDER BY average_rating DESC
       LIMIT 50;`,
            [currentYear]
        );
        return rows;
    });

    fastify.get("/movies/random", async (req, reply) => {
        const [rows] = await fastify.mysql.query(`
      SELECT primary_title, release_year, average_rating, numvotes, tconst, runtime
      FROM title
      WHERE numvotes > 10000
      ORDER BY RAND()
      LIMIT 10;
    `);
        return rows;
    });

    // similar movies
    fastify.get("/movies/similar/:tconst", async (req, reply) => {
        const { tconst } = req.params;
        try {
            const [rows] = await fastify.mysql.execute(
                `SELECT 
                    t2.primary_title,
                    t2.release_year,
                    t2.average_rating,
                    t2.numvotes,
                    t2.tconst,
                    t2.runtime
                FROM title t1
                CROSS JOIN title t2
                WHERE t1.tconst = ?
                AND t2.embedding IS NOT NULL 
                AND t1.embedding IS NOT NULL
                AND t2.tconst != ?
                ORDER BY VEC_DISTANCE_COSINE(t2.embedding, t1.embedding) ASC
                LIMIT 3`,
                [tconst, tconst]
            );

            if (rows.length === 0) {
                return reply.code(404).send({
                    error: "No similar movies found or movie doesn't exist",
                });
            }

            return rows;
        } catch (err) {
            fastify.log.error("Similar movies error:", err);
            return reply
                .code(500)
                .send({ error: "Failed to find similar movies" });
        }
    });
}
