const express = require('express');
const session = require('express-session');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
require('dotenv/config');

app.use(bodyParser.json());
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));

// Import Routes
const MarketRoute = require('./routes/market');
const usersRoute = require('./routes/users');
app.use('/market', MarketRoute);
app.use('/user', usersRoute);

// Connect to DB
mongoose.connect(process.env.DB_CONNECTION, () => 
    console.log("Connected to DB!")
);

// Listen to the server
app.listen(3000);
