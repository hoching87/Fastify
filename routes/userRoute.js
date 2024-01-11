import fastifyAuth from "@fastify/auth";

/**
 * Encapsulates the routes
 * @param {import('fastify').FastifyInstance} fastify Instance of Fastify
 * @param {Object} options plugin options, refer to https://www.fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
export default async function (fastify, options) {
	fastify.register(fastifyAuth);
	await fastify.after();

	fastify.addHook("onRequest", async (request, reply) => {
		try {
			// Verify JWT
			await request.jwtVerify();
		} catch (err) {
			reply.send(err);
		}
	});

	fastify.addHook(
		"preHandler",
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
	});

	fastify.get("/users", async (request, reply) => {
		const [rows, fields] = await fastify.pg.query("SELECT * FROM users");

		return rows;
	});
}
