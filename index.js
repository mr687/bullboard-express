"use strict";

require("dotenv/config");

const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

const Queue = require("bull");
const { ExpressAdapter } = require("@bull-board/express");
const { createBullBoard } = require("@bull-board/api");
const { BullAdapter } = require("@bull-board/api/bullAdapter");
const { compare } = require("bcrypt");

const isProduction = process.env.NODE_ENV === "production";
const host = "127.0.0.1";
const basePath = new URL(process.env.BOARD_BASE_PATH || "/", `http://${host}`)
	.pathname;
const redisOptions = {
	host: process.env.REDIS_HOST || "127.0.0.1",
	port: process.env.REDIS_PORT || 6379,
	username: process.env.REDIS_USERNAME || "default",
	password: process.env.REDIS_PASSWORD || "",
	tls: process.env.REDIS_TLS === "true",
};

const createQueue = (name) =>
	new Queue(name, {
		redis: redisOptions,
		prefix: process.env.BULL_QUEUE_PREFIX || "bull",
	});

async function basicAuthMiddleware(req, res, next) {
	if (!req.url.startsWith(basePath)) {
		return next();
	}
	const errorAuth = () => {
		res.set("WWW-Authenticate", 'Basic realm="Your realm" charset="UTF-8"');
		return res.status(401).send("Authentication required.");
	};
	const auth = req.headers.authorization || null;
	if (!auth || !/^Basic\s/.test(auth)) {
		return errorAuth();
	}
	const authBasic = Buffer.from(auth.split("Basic ")[1], "base64")
		.toString()
		.split(":");
	if (authBasic.length !== 2) {
		return errorAuth();
	}
	const [email, password] = authBasic;
	const { USER_NAME, USER_PASSWORD } = process.env || {};
	if (email !== USER_NAME) {
		return errorAuth();
	}
	const isPasswordValid = await compare(password, USER_PASSWORD);
	if (!isPasswordValid) {
		return errorAuth();
	}
	return next();
}

function createQueues() {
	const queueNames = (process.env.BULL_QUEUE_NAMES || "").split(",");
	return queueNames.map((name) => createQueue(name));
}

async function main() {
	const queues = createQueues();
	const queueAdapters = queues.map((queue) => new BullAdapter(queue));

	const serverAdapter = new ExpressAdapter();
	serverAdapter.setBasePath(basePath);

	createBullBoard({
		queues: queueAdapters,
		serverAdapter,
	});

	const app = express();

	app.use(helmet());
	app.use(cors());
	app.use(morgan(isProduction ? "combined" : "dev"));
	app.use(basicAuthMiddleware);
	app.use(basePath, serverAdapter.getRouter());

	const appPort = +(process.env.PORT || 3000);
	app.listen(appPort, () => {
		console.log(`Server listening on port http://${host}:${appPort}`);
		console.log(
			`Bull Board UI available on http://${host}:${appPort}${basePath}`
		);
	});
}

main().catch(console.error);
