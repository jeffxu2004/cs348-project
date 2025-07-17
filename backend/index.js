import Fastify from "fastify";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const fastify = Fastify({ logger: true });
import cors from "@fastify/cors";

// JWT secret - in production, use environment variable
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

(async () => {
  // Create DB connection
  const db = await mysql.createConnection({
    host: "localhost",
    user: "admin",
    password: "pass",
    database: "movie_app",
  });

  // JWT verification middleware
  const verifyToken = async (request, reply) => {
    try {
      const token =
        request.cookies.token ||
        request.headers.authorization?.replace("Bearer ", "");
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
  await fastify.register(import("@fastify/cookie"), {
    secret: JWT_SECRET,
  });

  // test env: allow localhost
  await fastify.register(cors, {
    origin: "http://localhost:5173",
    credentials: true,
  });

  // sanity check route - UPDATED for new schema
  fastify.get("/", async function (request, reply) {
    const [rows] = await db.query("SELECT * FROM title LIMIT 5");
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
        "SELECT userid, username, password, isAdmin FROM user WHERE username = ?",
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
          isAdmin: user.isAdmin,
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Set HTTP-only cookie
      reply.setCookie("token", token, {
        httpOnly: true,
        secure: false, // set to true in production with HTTPS
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      return {
        success: true,
        user: {
          userid: user.userid,
          username: user.username,
          isAdmin: user.isAdmin,
        },
      };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: "Login failed" });
    }
  });

  // Logout endpoint
  fastify.post("/logout", async (request, reply) => {
    reply.clearCookie("token");
    return { success: true, message: "Logged out successfully" };
  });

  // Get current user info
  fastify.get("/me", { preHandler: verifyToken }, async (request, reply) => {
    return { user: request.user };
  });

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
        const [existing] = await db.execute(
          "SELECT tconst FROM title WHERE tconst = ?",
          [tconst]
        );

        if (existing.length > 0) {
          return reply.code(400).send({ error: "Movie already exists" });
        }

        await db.execute(
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
          await db.execute(
            "INSERT INTO genres (tconst, genres) VALUES (?, ?)",
            [tconst, genre]
          );
        }

        // Insert directors
        for (const directorNconst of directors) {
          await db.execute(
            "INSERT INTO director (tconst, nconst) VALUES (?, ?)",
            [tconst, directorNconst]
          );
        }

        // Insert writers
        for (const writerNconst of writers) {
          await db.execute(
            "INSERT INTO writer (tconst, nconst) VALUES (?, ?)",
            [tconst, writerNconst]
          );
        }

        return { success: true, message: "Movie added successfully", tconst };
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
        const [existing] = await db.execute(
          "SELECT tconst FROM title WHERE tconst = ?",
          [tconst]
        );

        if (existing.length === 0) {
          return reply.code(404).send({ error: "Movie not found" });
        }

        // Delete related records first
        await db.execute("DELETE FROM favorites WHERE tconst = ?", [tconst]);
        await db.execute("DELETE FROM genres WHERE tconst = ?", [tconst]);
        await db.execute("DELETE FROM director WHERE tconst = ?", [tconst]);
        await db.execute("DELETE FROM writer WHERE tconst = ?", [tconst]);
        await db.execute("DELETE FROM principal WHERE tconst = ?", [tconst]);

        // Finally delete the movie
        const [result] = await db.execute(
          "DELETE FROM title WHERE tconst = ?",
          [tconst]
        );

        if (result.affectedRows === 0) {
          return reply.code(404).send({ error: "Movie not found" });
        }

        return { success: true, message: "Movie deleted successfully" };
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: "Failed to delete movie" });
      }
    }
  );

  // Get user's favorites
  fastify.get(
    "/favorites",
    { preHandler: verifyToken },
    async (request, reply) => {
      try {
        const [rows] = await db.execute(
          `
                SELECT t.tconst, t.primary_title, t.release_year, t.average_rating
                FROM favorites f
                JOIN title t ON f.tconst = t.tconst
                WHERE f.userid = ?
                ORDER BY t.primary_title
            `,
          [request.user.userid]
        );

        return rows;
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: "Failed to fetch favorites" });
      }
    }
  );

  // Add to favorites
  fastify.post(
    "/favorites",
    { preHandler: verifyToken },
    async (request, reply) => {
      const { tconst } = request.body;

      if (!tconst) {
        return reply.code(400).send({ error: "Movie ID required" });
      }

      try {
        // Check if already in favorites
        const [existing] = await db.execute(
          "SELECT * FROM favorites WHERE tconst = ? AND userid = ?",
          [tconst, request.user.userid]
        );

        if (existing.length > 0) {
          return reply.code(400).send({ error: "Already in favorites" });
        }

        await db.execute(
          "INSERT INTO favorites (userid, tconst) VALUES (?, ?)",
          [request.user.userid, tconst]
        );

        return { success: true, message: "Added to favorites" };
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: "Failed to add favorite" });
      }
    }
  );

  // Remove from favorites
  fastify.delete(
    "/favorites/:tconst",
    { preHandler: verifyToken },
    async (request, reply) => {
      const { tconst } = request.params;

      try {
        const [result] = await db.execute(
          "DELETE FROM favorites WHERE tconst = ? AND userid = ?",
          [tconst, request.user.userid]
        );

        if (result.affectedRows === 0) {
          return reply.code(404).send({ error: "Favorite not found" });
        }

        return { success: true, message: "Removed from favorites" };
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: "Failed to remove favorite" });
      }
    }
  );

  // search API
  fastify.get("/search", async (request, reply) => {
    const { q } = request.query;

    if (!q || q.length < 2) {
      return reply.code(400).send({ error: "Query too short" });
    }

    try {
      const [rows] = await db.execute(
        "SELECT tconst, primary_title, release_year FROM title WHERE primary_title LIKE ? LIMIT 20",
        [`%${q}%`]
      );
      return rows;
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: "Database query failed" });
    }
  });

  // Get movie details with cast and crew
  fastify.get("/movie/:tconst", async (request, reply) => {
    const { tconst } = request.params;

    try {
      // Get movie basic info
      const [movieRows] = await db.execute(
        "SELECT * FROM title WHERE tconst = ?",
        [tconst]
      );

      if (movieRows.length === 0) {
        return reply.code(404).send({ error: "Movie not found" });
      }

      const movie = movieRows[0];

      // Get genres
      const [genreRows] = await db.execute(
        "SELECT genres FROM genres WHERE tconst = ?",
        [tconst]
      );

      // Get directors
      const [directorRows] = await db.execute(
        `
                SELECT p.name 
                FROM director d 
                JOIN people p ON d.nconst = p.nconst 
                WHERE d.tconst = ?
            `,
        [tconst]
      );

      // Get writers
      const [writerRows] = await db.execute(
        `
                SELECT p.name 
                FROM writer w 
                JOIN people p ON w.nconst = p.nconst 
                WHERE w.tconst = ?
            `,
        [tconst]
      );

      // Get cast
      const [castRows] = await db.execute(
        `
                SELECT DISTINCT p.nconst, p.name, pr.character_name
                FROM principal pr
                JOIN people p ON pr.nconst = p.nconst
                WHERE pr.tconst = ? AND pr.category IN ('actor', 'actress')
                ORDER BY pr.ordering
            `,
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
              return Array.isArray(parsed) ? parsed.join(", ") : parsed;
            } catch {
              return p.character_name;
            }
          })(),
        })),
      };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: "Failed to fetch movie details" });
    }
  });

  fastify.get("/people/:nconst", async (request, reply) => {
    const { nconst } = request.params;

    try {
      // Get actor basic info
      const [actorRows] = await db.execute(
        "SELECT * FROM people WHERE nconst = ?",
        [nconst]
      );
      if (actorRows.length === 0) {
        return reply.code(404).send({ error: "Actor not found" });
      }
      const actor = actorRows[0];

      // Get co-actors with count of shared unique movies in a single query
      const [coActorsRows] = await db.execute(
        `
      SELECT 
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
      LIMIT 20
      `,
        [nconst, nconst]
      );

      return { actor, coActors: coActorsRows };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: "Failed to fetch actor details" });
    }
  });

  // Shared movies for query above
  fastify.get("/shared-movies/:actor1/:actor2", async (request, reply) => {
    const { actor1, actor2 } = request.params;

    try {
      const [rows] = await db.execute(
        `
      SELECT DISTINCT
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
        AND p2.category IN ('actor', 'actress')
      GROUP BY t.tconst, t.primary_title, t.release_year
      ORDER BY t.primary_title
      `,
        [actor1, actor2]
      );

      return { sharedMovies: rows };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: "Failed to fetch shared movies" });
    }
  });

  fastify.get("/movies/top-rated", async (req, reply) => {
    const [rows] = await db.query(`
        SELECT primary_title, release_year, average_rating, numvotes, tconst, runtime
        FROM title
        WHERE numvotes > 10000
        ORDER BY average_rating DESC, numvotes DESC
        LIMIT 100;
    `);
    return rows;
  });

  fastify.get("/movies/most-popular", async (req, reply) => {
    const [rows] = await db.query(`
            SELECT primary_title, release_year, average_rating, numvotes, tconst, runtime
            FROM title
            ORDER BY numvotes DESC
            LIMIT 100;
        `);
    return rows;
  });

  fastify.get("/movies/best-of-year", async (req, reply) => {
    const currentYear = new Date().getFullYear();
    const [rows] = await db.query(
      `
            SELECT primary_title, release_year, average_rating, numvotes, tconst, runtime
            FROM title
            WHERE release_year = ? AND numvotes > 5000
            ORDER BY average_rating DESC
            LIMIT 50;
        `,
      [currentYear]
    );
    return rows;
  });

  fastify.get("/movies/random", async (req, reply) => {
    const [rows] = await db.query(`
            SELECT primary_title, release_year, average_rating, numvotes, tconst, runtime
            FROM title
            WHERE numvotes > 10000
            ORDER BY RAND()
            LIMIT 10;
        `);
    return rows;
  });
  fastify.get(
    '/users/:userid/gini',
    //{ preHandler: verifyToken },
    async (request, reply) => {
      const { userid } = request.params;

      const sql = `
        SELECT userid, gini_index
        FROM user_gini_cache
        WHERE user_gini_cache.userid = ?;
      `;

      try {
        // we pass `userid` twice: once for the CTE, once for total_movies
        const [rows] = await db.execute(sql, [userid]);

        if (rows.length === 0) {
          return reply.code(404).send({ error: 'User not found or no favorites recorded' });
        }

        // If you expect only one row, return the first element:
        return reply.send(rows[0]);
      } catch (err) {
        request.log.error(err);
        return reply.code(500).send({ error: 'Database error while computing gini index' });
      }
    }
  );

  fastify.get(
  '/gini-percentile',
  async (request, reply) => {
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
      const [rows] = await db.execute(sql, [parseFloat(value)]);
      return reply.send(rows[0]); // e.g. { percentile: 86.71 }
    } catch (err) {
      request.log.error(err);
      return reply.code(500).send({ error: 'Failed to compute percentile' });
    }
  }
);

  fastify.get("/movies/:tconst", async (request, reply) => {
    const { tconst } = request.params;

    try {
      const [rows] = await db.query(
        `
            SELECT
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
            GROUP BY t.tconst, t.primary_title, t.numvotes, t.runtime, t.release_year
            `,
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

  fastify.put(
    "/movies/:tconst",
    { preHandler: verifyToken },
    async (request, reply) => {
      const { tconst } = request.params;
      const { primary_title, average_rating, release_year, runtime, numvotes } =
        request.body;

      // Optional: Restrict to admin users
      if (!request.user.isAdmin) {
        return reply.code(403).send({ error: "Admin access required" });
      }

      try {
        const [result] = await db.execute(
          `
                UPDATE title 
                SET 
                    primary_title = ?,
                    average_rating = ?,
                    release_year = ?,
                    runtime = ?,
                    numvotes = ?
                WHERE tconst = ?
            `,
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
        return reply.code(500).send({ error: "Failed to update movie" });
      }
    }
  );

  // Start server
  try {
    const address = await fastify.listen({ port: 3000 });
    console.log(`Server listening on ${address}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})();
