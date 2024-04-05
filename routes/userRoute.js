import fastifyAuth from "@fastify/auth";

/**
 * Encapsulates the routes
 * @param {import('fastify').FastifyInstance} fastify Instance of Fastify
 * @param {Object} options plugin options, refer to https://www.fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
export default async function (fastify, options) {
	fastify.register(fastifyAuth);
	await fastify.after();

	fastify.addHook("onRequest",
		async (request, reply) => {
			try {
				// Verify JWT
				await request.jwtVerify();
				var now = new Date();
				const redisKey = request.user.username + ':' + now.getMinutes()
				const rateLimitTransac = await fastify.redis.multi().incr(redisKey).expire(redisKey, 60).exec()
				if (rateLimitTransac[0][1] > 5) {
					reply.status(429).send('limited')
				}
			} catch (err) {
				reply.send(err);
			}
		}
	);

	fastify.addHook("preHandler",
		// Authorization
		fastify.auth([
			(request, reply, done) => {
				// done(new Error("aasdasd"));
				done();
			},
		])
	);

	fastify.get("/", async (request, reply) => {
		reply.send({ jwt: request.user });
		// fastify.log.error('nice error')
	});

	fastify.get("/users", async (request, reply) => {
		const [rows, fields] = await fastify.mysql.query("SELECT * FROM users");

		return rows;
	});
}
