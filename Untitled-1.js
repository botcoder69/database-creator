
const Database = require('@replit/database');
const express = require('express');

const db = new Database(); 
const server = express();
const responses = {
	/**
	 * @param {(import 'express').Response<any, Record<string, any>, number>} res 
	 */
	unauthorized(res) {
		res.status(401)
			.send({ message: `401: Unauthorized`, code: 0 });
	},
	/**
	 * @param {(import 'express').Response<any, Record<string, any>, number>} res 
	 */
	methodNotAllowed(res) {
		res.sendStatus(405)
			.send({ message: `405: Method not allowed`, code: 0 });
	},
	/**
	 * @param {(import 'express').Response<any, Record<string, any>, number>} res 
	 */
	notFound(res) {
		res.sendStatus(404)
			.send({ message: `404: Not Found`, code: 0 });
	}
};





function createAdditionalSkybotDatabase() {
	server.all('/', (req, res) => {
		responses.notFound(res);
	});

	server.all('/ping', (req, res) => {
		if (req.method === 'GET') {
			res.status(202)
				.send({ message: '202: Accepted + Pong', code: 0 }
				);
		} else {
			responses.methodNotAllowed(res);
		}
	});

	server.all('/database', async (req, res) => {
		if (req.headers.authorization !== process.env.DB_AUTH) responses.unauthorized(res);

		if (req.method === 'GET') {
			const { key } = req.body;

			const value = await db.get(key);

			try {
				res.status(200)
					.send({ value: value });
			} catch (error) {
				res.status(500)
					.send({ message: `500 Internal Server Error`, code: 0 });
			}
		} else if (req.method === 'POST') {
			const { key, value } = req.body;
			
			try {
				await db.set(key, value);

				res.status(200)
					.send({ message: `200 Ok`, code: 0 });
			} catch (error) {
				res.status(500)
					.send({ message: `500 Internal Server Error`, code: 0 });
			}
		}
	});
}

createAdditionalSkybotDatabase();