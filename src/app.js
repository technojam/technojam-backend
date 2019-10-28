const express = require('express');
const app = express();
const connection = require('./utils/connection');
const helmet = require('helmet');
const cors = require('cors');
const PORT = process.env.PORT || 4000;
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
app.use('/api/events', require('./routes/events'));
app.use('/api/projects', require('./routes/projects'));

app.listen(PORT, () => console.log(`server started at port ${PORT}`));
