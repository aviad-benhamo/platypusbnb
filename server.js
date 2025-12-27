import http from 'http'
import path from 'path'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { logger } from './services/logger.service.js'
import { stayRoutes } from './api/stay/stay.route.js'
import { userRoutes } from './api/user/user.routes.js'
import { authRoutes } from './api/auth/auth.routes.js'
import { socketService } from './services/socket.service.js'
import { orderRoutes } from './api/order/order.routes.js'

const app = express()
const server = http.createServer(app)

// Express Config
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())


if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('public')))
} else {
    const corsOptions = {
        origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
        credentials: true
    }
    app.use(cors(corsOptions))
}


// Routes
app.use('/api/stay', stayRoutes)
app.use('/api/user', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/order', orderRoutes)


// Setup Socket API
setupSocketAPI(server)


// Fallback route
app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})


const port = process.env.PORT || 3030
server.listen(port, () => {
    logger.info(`Server is running on port: http://127.0.0.1:${port}`)
})

function setupSocketAPI(server) {
    socketService.setupSocketAPI(server)
}