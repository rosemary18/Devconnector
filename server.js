const express = require('express');
const mongoose = require('mongoose');

//API adddress require
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

const app = express();
app.get('/', (req, res) => res.send('Web Service Running'));

//Database connection
const db = require('./config/keys').mongoURI;
mongoose
	.connect(db, { useNewUrlParser: true })
	.then(() => console.log('MongoDB Connected'))
	.catch(err => console.log(err));

//Setting Port
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Service on port ${port} is active.`));

//use routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);
