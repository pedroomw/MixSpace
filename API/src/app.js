import express from "express"
import filesRouter from './routes/files.js'

const app = express();
console.log(process.env)
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: 'API funcionando' });
});

app.use('/files', filesRouter)

app.listen(PORT, () => {
  console.log(`API MixSpace inicializada en http://localhost:${PORT}`);
});
