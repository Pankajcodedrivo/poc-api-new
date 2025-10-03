require('dotenv').config(); // load .env

const express = require('express');
const travelRoutes = require('./routes/travelRoutes');

const app = express();
app.use(express.json());

// Routes
app.use('/api/travel', travelRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
