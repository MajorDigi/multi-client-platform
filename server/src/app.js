const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Health check — used to verify IIS reverse proxy wiring in Step 3
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
