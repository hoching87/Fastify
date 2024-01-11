import bcrypt from "bcrypt";

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://www.fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
export default async function (fastify, options) {
	fastify.get("/", async (request, reply) => {
		return { hello: "public" };
	});

	fastify.post("/register", async (request, reply) => {
		const hash = await bcrypt.hash(request.body.password, 10);

		await fastify.pg.query("INSERT INTO users (name, hash) VALUES (?, ?);", [
			request.body.email,
			hash,
		]);

		return "ok";
	});

	fastify.post("/login", async (request, reply) => {
		let dbresult;
		[dbresult] = await fastify.pg.query(
			"SELECT hash FROM users WHERE name=? LIMIT 1",
			[request.body.email]
		);

		const match = await bcrypt.compare(request.body.password, dbresult[0].hash);

		if (match) {
			const token = fastify.jwt.sign({ user: request.body.email });
			return { token };
		}
		return { match };
	});
}
