import { stayService } from './stay.service.js'
import { logger } from '../../services/logger.service.js'

export async function getStays(req, res) {
    try {
        const filterBy = {
            txt: req.query.txt || '',
            minPrice: +req.query.minPrice || 0,
            maxPrice: +req.query.maxPrice || 0,
            guests: +req.query.guests || 0,
            pets: req.query.pets === 'true', // Convert string 'true' to boolean
            loc: req.query.loc || '',
            hostId: req.query.hostId || '',
            sortBy: req.query.sortBy || ''
        }

        const stays = await stayService.query(filterBy)
        res.json(stays)
    } catch (err) {
        logger.error('Failed to get stays', err)
        res.status(500).send({ err: 'Failed to get stays' })
    }
}

export async function getStayById(req, res) {
    try {
        const stayId = req.params.id
        const stay = await stayService.getById(stayId)
        res.json(stay)
    } catch (err) {
        logger.error('Failed to get stay', err)
        res.status(500).send({ err: 'Failed to get stay' })
    }
}

export async function addStay(req, res) {
    const { loggedinUser } = req

    try {
        const stay = req.body
        stay.host = loggedinUser

        const addedStay = await stayService.save(stay)
        res.json(addedStay)
    } catch (err) {
        logger.error('Failed to add stay', err)
        res.status(500).send({ err: 'Failed to add stay' })
    }
}

export async function updateStay(req, res) {
    try {
        const stay = req.body
        const updatedStay = await stayService.save(stay)
        res.json(updatedStay)
    } catch (err) {
        logger.error('Failed to update stay', err)
        res.status(500).send({ err: 'Failed to update stay' })
    }
}

export async function removeStay(req, res) {
    try {
        const stayId = req.params.id
        await stayService.remove(stayId)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to remove stay', err)
        res.status(500).send({ err: 'Failed to remove stay' })
    }
}

export async function addStayMsg(req, res) {
    const { loggedinUser } = req
    try {
        const stayId = req.params.id
        const msg = {
            txt: req.body.txt,
            by: loggedinUser
        }
        const savedMsg = await stayService.addStayMsg(stayId, msg)
        res.json(savedMsg)
    } catch (err) {
        logger.error('Failed to update stay', err)
        res.status(500).send({ err: 'Failed to update stay' })
    }
}

export async function removeStayMsg(req, res) {
    try {
        const stayId = req.params.id
        const { msgId } = req.params

        const removedId = await stayService.removeStayMsg(stayId, msgId)
        res.send(removedId)
    } catch (err) {
        logger.error('Failed to remove stay msg', err)
        res.status(500).send({ err: 'Failed to remove stay msg' })
    }
}