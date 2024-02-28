const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 2000;
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const adminRoutes = require('./Routes/adminRoutes');

const db = require('./config/db');

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('uploads'));


// CORS Headers (Wildcard)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});


// Router Configuration
app.use('/api', adminRoutes);


app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
