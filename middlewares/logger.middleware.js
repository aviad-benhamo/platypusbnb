import { logger } from '../services/logger.service.js'

export async function log(req, res, next) {
    const user = req.loggedinUser ? req.loggedinUser.fullname : 'Guest'
    logger.info(`Req from ${user} | Method: ${req.method} | Path: ${req.originalUrl}`)
    next()
}