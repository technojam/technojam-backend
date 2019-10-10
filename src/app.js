const express = require('express');
const app = express();

const connection = require('./utils/connection');
const helmet = require('helmet');
const cors = require('cors');

connection.connectDB();
app.use(helmet());
app.use(cors());
app.use(express.json({ extended: false }));
app.use(express.static('src/docs/'));

app.get('/', (req, res) => {
	res.sendFile('index.html');
});
app.use('/api/login', require('./routes/login'));
app.use('/api/register', require('./routes/register'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/contact', require('./routes/contact'));

app.listen(4000, () => console.log('server started at port 4000'));
