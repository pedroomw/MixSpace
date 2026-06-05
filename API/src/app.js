import dotenv from 'dotenv'
dotenv.config({path: "./.env"})

import express from "express"
import filesRouter from './routes/files-controller.js'

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: 'API funcionando' });
});

app.use('/files', filesRouter)

app.listen(PORT, () => {
  console.log(`API MixSpace inicializada en http://localhost:${PORT}`);
});
