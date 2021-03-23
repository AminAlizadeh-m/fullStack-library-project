if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');

const indexRouter = require('./routes/index');

const port = process.env.PORT;
const host = process.env.HOST;
const dbUrl = process.env.DATABASE_URL;

mongoose.connect(dbUrl, {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', error => console.log('Database connection error : ' + error));
db.once('open', () => console.log('Successfully connected to database!'));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));

app.use('/', indexRouter);

app.listen(port, () => {
   console.log(`Server is running on http://${host}:${port} ...`);
});