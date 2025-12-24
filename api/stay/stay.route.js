import express from 'express'
import { getStays, getStayById, addStay, updateStay, removeStay, addStayMsg, removeStayMsg } from './stay.controller.js'
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

const router = express.Router()

router.get('/', log, getStays)
router.get('/:id', log, getStayById)

// Protected routes
router.post('/', requireAuth, addStay)
router.put('/', requireAuth, updateStay)
router.delete('/:id', requireAuth, removeStay) // Changed from requireAdmin to requireAuth (hosts delete their own stays)

// --- Msg support ---
router.post('/:id/msg', requireAuth, addStayMsg)
router.delete('/:id/msg/:msgId', requireAuth, removeStayMsg)

export const stayRoutes = router