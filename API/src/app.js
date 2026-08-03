import 'dotenv/config'
import express from "express"
import filesRouter from './routes/version-routes.js'
import authRouter from './routes/auth-routes.js'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3000
const FRONT_PORT = process.env.FRONTEND_PORT || 5173

app.use(express.json())

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.get('/', (req, res) => {
  res.json({ mensaje: 'API funcionando' })
})

app.use('/versions', filesRouter)
app.use('/auth', authRouter)

app.listen(PORT, () => {
  console.log(`API MixSpace inicializada en http://localhost:${PORT}`)
})