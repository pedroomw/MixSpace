import 'dotenv/config'
import express from "express"
import filesRouter from './routes/version-routes.js'
import authRouter from './routes/auth-routes.js'
import projectsRouter from './routes/projects-routes.js'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3000
const FRONT_PORT = process.env.FRONTEND_PORT || 5173

app.use(express.json())

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps, etc.)
    if (!origin) return callback(null, true);
    // Allow any localhost port in development
    if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
    callback(new Error(`CORS: origin not allowed — ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.get('/', (req, res) => {
  res.json({ mensaje: 'API funcionando' })
})

app.use('/versions', filesRouter)
app.use('/auth', authRouter)
app.use('/projects', projectsRouter)

app.listen(PORT, () => {
  console.log(`API MixSpace inicializada en http://localhost:${PORT}`)
})