import Fastify from "fastify";
import multipart from "@fastify/multipart";
import jwt from "@fastify/jwt";
import mysql from "@fastify/mysql";
import fastifyRedis from "@fastify/redis";
import publicRoute from "./routes/publicRoute.js";
import userRoute from "./routes/userRoute.js";

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
	logger: {
		file: './log/log.txt'
	},
});

// initialize
fastify.register(multipart, { attachFieldsToBody: "keyValues" });
fastify.register(jwt, { secret: "supersecret" });
fastify.register(mysql, {
	connectionString: "mysql://root:qwe123@localhost/fastify",
	promise: true,
});
fastify.register(fastifyRedis)

// Route
fastify.register(publicRoute);
fastify.register(userRoute, { prefix: "user/" });

fastify.listen({ host: "0.0.0.0", port: 10000 }, function (err, address) {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
});
