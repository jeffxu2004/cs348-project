import mysql from '@fastify/mysql';

export default async function dbConnector(fastify, options) {
  fastify.register(mysql, {
    promise: true,
    connectionString: 'mysql://admin:pass@localhost/movie_app'
  });
}
