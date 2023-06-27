	
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
	},
	internalServerError(res) {
		res.status(500)
			.send({ message: `500 Internal Server Error`, code: 0 });
	}
};





function createAdditionalCluster() {
	server.use(express.json());

	server.all('/', (req, res) => {
		responses.notFound(res);
	});

	server.all('/ping', (req, res) => {
		if (req.method === 'GET') {
			res.status(202)
				.send({ message: '202: Accepted + Pong', code: 0 });
		} else {
			responses.methodNotAllowed(res);
		}
	});

	server.all('/database', (req, res) => {
		responses.notFound(res);
	});

	server.all('/database/:key', async (req, res) => {
		if (req.headers.authorization !== process.env.DB_AUTH) return responses.unauthorized(res);

		

		const { key } = req.params;
		
		if (key === 'url') {
			try {
				res.status(200)
					.json({ value: process.env.REPLIT_DB_URL });
			} catch (error) {
				console.error(error);

				responses.badRequest(res);
			}
		} else if (key === 'list') {
			try {
				const list = await db.list();
				
				try {
					res.status(200)
						.json({ value: list });
				} catch (error) {
					console.error(error);

					responses.internalServerError(res);
				}
			} catch (error) {
				console.error(error);

				responses.badRequest(res);
			}
		} else if (req.method === 'GET') {
			try {
				const value = await db.get(key);
	
				try {
					res.status(200)
						.json({ value: value });
				} catch (error) {
					console.error(error);

					responses.internalServerError(res);
				}
			} catch (error) {
				console.error(error);

				responses.badRequest(res);
			}
		} else if (req.method === 'POST') {
			try {
				const { value } = req.body;
				
				try {
					await db.set(key, value);
	
					res.status(200)
						.send({ message: `200 Ok`, code: 0 });
				} catch (error) {
					responses.internalServerError(res);
				}
			} catch (error) {
				responses.badRequest(res);
			}
		} else if (req.method === 'DELETE') {
			try {			
				try {
					await db.delete(key);
	
					res.status(200)
						.send({ message: `200 Ok`, code: 0 });
				} catch (error) {
					responses.internalServerError(res);
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

createAdditionalCluster();
