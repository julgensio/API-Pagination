const express = require('express');
const mongoose = require('mongoose');
const app = express();
const User = require('./users');

const URI = '';
mongoose.connect(URI, {
	useUnifiedTopology: true,
	useNewUrlParser: true,
});

const db = mongoose.connection;
// console.log(db);
db.once('open', async () => {
	if ((await User.countDocuments({}).exec()) > 0) return;

	Promise.all([
		User.create({ name: 'User 1' }),
		User.create({ name: 'User 2' }),
		User.create({ name: 'User 3' }),
		User.create({ name: 'User 4' }),
		User.create({ name: 'User 5' }),
		User.create({ name: 'User 6' }),
		User.create({ name: 'User 7' }),
		User.create({ name: 'User 8' }),
		User.create({ name: 'User 9' }),
		User.create({ name: 'User 10' }),
		User.create({ name: 'User 11' }),
		User.create({ name: 'User 12' }),
	]).then(() => console.log('Added users...'));
});

app.get('/users', paginatedResult(User), (req, res) => {
	res.json(res.paginatedResult);
});

// Middleware
function paginatedResult(model) {
	return async (req, res, next) => {
		const page = parseInt(req.query.page);
		const limit = parseInt(req.query.limit);

		console.log('This page: ', page);
		console.log('This limit: ', limit);

		// Page start with index 1 and page - 1 is 0 (first index of an array)
		const startIndex = (page - 1) * limit;
		const endIndex = page * limit;

		console.log('start index: ', startIndex);
		console.log('end index: ', endIndex);

		// Add additional object within result
		const results = {};

		// Removes users removes previous section
		// count within the document and excute
		if (endIndex < (await model.countDocuments().exec())) {
			results.next = {
				page: page + 1,
				limit: limit,
			};
		}

		// Add next page to object
		if (startIndex > 0) {
			results.previous = {
				//
				page: page - 1,
				limit: limit,
			};
		}
		try {
			results.results = await model.find().limit(limit).skip(startIndex).exec();
			res.paginatedResult = results;
			next();
		} catch (e) {
			res.status(500).json({ message: e.message });
		}
	};
}

const port = process.env.port || 3001;
app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
