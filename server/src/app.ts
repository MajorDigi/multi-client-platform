import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// Health check — used to verify IIS reverse proxy wiring in Step 3
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
