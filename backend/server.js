const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const { checkConnection } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/v1/incidents', require('./routes/incidentRoutes'));

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Crime Incident Mapping System API is running' });
});

// Start Server
const startServer = async () => {
  await checkConnection();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
