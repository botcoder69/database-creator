
const Database = require('@replit/database');
const express = require('express');

const db = new Database(); 
const server = express();
const responses = {
	badRequest(res) {
		res.status(400)
			.send({ message: `400: Bad Request`, code: 0 });
	},
	unauthorized(res) {
		res.status(401)
			.send({ message: `401: Unauthorized`, code: 0 });
	},
	methodNotAllowed(res) {
		res.status(405)
			.send({ message: `405: Method not allowed`, code: 0 });
	},
	notFound(res) {
		res.status(404)
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
			try {
				const { key } = req.body;

				const value = await db.get(key);
	
				try {
					res.status(200)
						.send({ value: value });
				} catch (error) {
					res.status(500)
						.send({ message: `500 Internal Server Error`, code: 0 });
				}
			} catch (error) {
				responses.badRequest(res);
			}
		} else if (req.method === 'POST') {
			try {
				const { key, value } = req.body;
			
				try {
					await db.set(key, value);
	
					res.status(200)
						.send({ message: `200 Ok`, code: 0 });
				} catch (error) {
					res.status(500)
						.send({ message: `500 Internal Server Error`, code: 0 });
				}
			} catch (error) {
				responses.badRequest(res);
			}
		}
	});

	server.listen(3000, () => {
		console.log(`[Server][Logging] | Database is Ready!`);
	});
}

createAdditionalSkybotDatabase();
