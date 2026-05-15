import express from "express"

const app = express();
const PORT = 3000;

app.use(express.json()); 

app.get('/', (req, res) => {
  res.json({ mensaje: 'API funcionando' });
});

app.listen(PORT, () => {
  console.log(`API MixSpace inicializada en http://localhost:${PORT}`);
});
