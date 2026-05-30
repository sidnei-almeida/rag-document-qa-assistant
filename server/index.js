import express from 'express';
import cors from 'cors';
import { router } from './routes/index.js';

const PORT = Number(process.env.PORT) || 3001;
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
app.use(router);

app.listen(PORT, () => {
  console.log(`DocMind API listening on http://localhost:${PORT}`);
});
