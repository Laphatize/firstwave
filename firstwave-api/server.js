require('dotenv').config();
const express = require('express');
const app = express();
const organizationsRoute = require('./routes/organizations');
const usersRoute = require('./routes/users');

// Middleware setup
app.use(express.json());

// Routes
app.use('/api/organizations', organizationsRoute);
app.use('/api/users', usersRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

