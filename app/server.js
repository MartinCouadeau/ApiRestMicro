import express from 'express';
import routes from './routes/index.js';
import { initDB } from './db.js';
import { populateDB } from './dbInit.js';

const app = express();
app.use(express.json());
app.use(routes);

try {
  const db = await initDB();
  await populateDB();

  app.listen(3001, () => {
    console.log('Server listening at http://localhost:3001/');
  });
} catch (err) {
  console.error(err);
}
