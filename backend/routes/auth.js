import jwt from 'jsonwebtoken';
import { JWT_SECRET, verifyToken } from '../middleware/auth.js';

export default async function authRoutes(fastify, options) {
  // Login endpoint
  fastify.post('/login', async (request, reply) => {
    const { username, password } = request.body;

    if (!username || !password) {
      return reply.code(400).send({ error: 'Username and password required' });
    }

    try {
      const [rows] = await fastify.mysql.execute(
        'SELECT userid, username, password, isAdmin FROM user WHERE username = ?',
        [username]
      );

      if (rows.length === 0) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      const user = rows[0];

      // For demo purposes, comparing plain text passwords
      // In production, you should hash passwords with bcrypt
      if (password !== user.password) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      // Create JWT token
      const token = jwt.sign(
        {
          userid: user.userid,
          username: user.username,
          isAdmin: user.isAdmin,
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Set HTTP-only cookie
      reply.setCookie('token', token, {
        httpOnly: true,
        secure: false, // set to true in production with HTTPS
        sameSite: 'lax',
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
      return reply.code(500).send({ error: 'Login failed' });
    }
  });

  // Logout endpoint
  fastify.post('/logout', async (request, reply) => {
    reply.clearCookie('token');
    return { success: true, message: 'Logged out successfully' };
  });

  // Get current user info
  fastify.get('/me', { preHandler: verifyToken }, async (request, reply) => {
    return { user: request.user };
  });
}
