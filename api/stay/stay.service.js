import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'
import { ObjectId } from 'mongodb'

export const stayService = {
    query,
    getById,
    remove,
    save,
    addStayMsg,
    removeStayMsg
}

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        const sortCriteria = _buildSortCriteria(filterBy)
        const collection = await dbService.getCollection('stay')
        var stays = await collection.find(criteria).sort(sortCriteria).toArray()

        return stays
    } catch (err) {
        logger.error('cannot find stays', err)
        throw err
    }
}

async function getById(stayId) {
    try {
        const collection = await dbService.getCollection('stay')
        let stay = await collection.findOne({ _id: _toObjectId(stayId) })
        if (!stay) {
            stay = await collection.findOne({ _id: stayId })
        }
        return stay
    } catch (err) {
        logger.error(`while finding stay ${stayId}`, err)
        throw err
    }
}

async function remove(stayId) {
    try {
        const collection = await dbService.getCollection('stay')
        await collection.deleteOne({ _id: _toObjectId(stayId) })
    } catch (err) {
        logger.error(`cannot remove stay ${stayId}`, err)
        throw err
    }
}

async function save(stay) {
    try {
        const collection = await dbService.getCollection('stay')
        if (stay._id) {
            const { _id, ...stayToSave } = stay
            const idToSearch = ObjectId.isValid(_id) ? _toObjectId(_id) : _id

            let result = await collection.updateOne({ _id: idToSearch }, { $set: stayToSave })

            if (result.matchedCount === 0 && ObjectId.isValid(_id)) {
                const fallbackId = (typeof idToSearch === 'string') ? new ObjectId(_id) : _id
                await collection.updateOne({ _id: fallbackId }, { $set: stayToSave })
            }

            return stay
        } else {
            stay.createdAt = Date.now()
            if (!stay.reviews) stay.reviews = []
            stay.msgs = []
            await collection.insertOne(stay)
            return stay
        }
    } catch (err) {
        logger.error('cannot save stay', err)
        throw err
    }
}

async function addStayMsg(stayId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ _id: _toObjectId(stayId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        logger.error(`cannot add stay msg ${stayId}`, err)
        throw err
    }
}

async function removeStayMsg(stayId, msgId) {
    try {
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ _id: _toObjectId(stayId) }, { $pull: { msgs: { id: msgId } } })
        return msgId
    } catch (err) {
        logger.error(`cannot remove stay msg ${stayId}`, err)
        throw err
    }
}

// --- Private Helper Functions ---

function _toObjectId(id) {
    return ObjectId.isValid(id) ? new ObjectId(id) : id
}

function _buildCriteria(filterBy) {
    const criteria = {}

    if (filterBy.txt) {
        const regex = new RegExp(filterBy.txt, 'i')
        criteria.$or = [
            { name: { $regex: regex } },
            { summary: { $regex: regex } }
        ]
    }

    if (filterBy.loc) {
        const locParts = filterBy.loc.split(',')
        const cityRegex = new RegExp(locParts[0].trim(), 'i')

        if (locParts.length > 1) {
            const countryRegex = new RegExp(locParts[1].trim(), 'i')
            criteria['loc.city'] = { $regex: cityRegex }
            criteria['loc.country'] = { $regex: countryRegex }
        } else {
            criteria['loc.city'] = { $regex: cityRegex }
        }
    }

    if (filterBy.ids && filterBy.ids.length > 0) {
        const idsToSearch = filterBy.ids.flatMap(id => {
            const variants = [id]
            if (ObjectId.isValid(id)) {
                variants.push(new ObjectId(id))
            }
            return variants
        })
        criteria._id = { $in: idsToSearch }
    }

    if (filterBy.guests) {
        criteria.capacity = { $gte: filterBy.guests }
    }

    if (filterBy.pets) {
        criteria.amenities = 'Pets allowed'
    }

    if (filterBy.minPrice || filterBy.maxPrice) {
        criteria.price = {}
        if (filterBy.minPrice) criteria.price.$gte = filterBy.minPrice
        if (filterBy.maxPrice) criteria.price.$lte = filterBy.maxPrice
    }

    if (filterBy.hostId) {
        criteria['host._id'] = filterBy.hostId
    }

    return criteria
}

function _buildSortCriteria(filterBy) {
    const criteria = {}
    if (filterBy.sortBy === 'price') {
        criteria.price = 1
    } else {
        criteria.createdAt = -1
    }
    return criteria
}