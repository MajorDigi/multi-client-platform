import 'dotenv/config';
import app from './src/app';

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
