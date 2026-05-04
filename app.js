import express from "express"

const app = express();
const PORT = 3000;

app.use(express.json()); 

app.get('/', (req, res) => {
  res.json({ mensaje: 'API funcionando' });
});

app.post("/")

app.use()

app.listen(PORT, () => {
  console.log(`API MixSpace inicializada YA en http://localhost:${PORT}`);
});
