import bcrypt from "bcrypt";
import axios from "axios";

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://www.fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
export default async function (fastify, options) {
	const telegramUrl =
		"https://api.telegram.org/bot6789436681:AAG-Z0IW9xxwcDRHBYXLpsrVJY3lQQZlWpk";

	fastify.get("/", async (request, reply) => {
		return { hello: "public" };
	});

	fastify.post("/webhook", async (request, reply) => {
		if (!Object.hasOwn(request.body, "message")) {
			// No message
		} else if (request.body.message.text == "/start") {
			await axios.post(telegramUrl + "/sendMessage", {
				chat_id: request.body.message.chat.id,
				text: `Hi ${request.body.message.chat.first_name} !`,
			});
		} else if (request.body.message.text == "/balance") {
			await axios.post(telegramUrl + "/sendMessage", {
				chat_id: request.body.message.chat.id,
				text:
					"$" +
					Math.floor(Math.random() * 1000000)
						.toString()
						.split(".")[0]
						.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
			});
		} else if (request.body.message.text) {
			await axios.post(telegramUrl + "/sendMessage", {
				chat_id: request.body.message.chat.id,
				text: request.body.message.text.split("").reverse().join(""),
			});
		}
		reply.send({});
	});

	fastify.post("/register", async (request, reply) => {
		const hash = await bcrypt.hash(request.body.password, 10);

		await fastify.mysql.query("INSERT INTO users (name, hash) VALUES (?, ?);", [
			request.body.email,
			hash,
		]);

		return "ok";
	});

	fastify.post("/login", async (request, reply) => {
		let dbresult;
		[dbresult] = await fastify.mysql.query(
			"SELECT hash FROM users WHERE name=? LIMIT 1",
			[request.body.email]
		);

		const match = await bcrypt.compare(request.body.password, dbresult[0].hash);

		if (match) {
			const token = fastify.jwt.sign({ username: request.body.email });
			return { token };
		}
		return { match };
	});
}
