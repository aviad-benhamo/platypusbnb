import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { ObjectId } from 'mongodb'

export const orderService = {
    query,
    getById,
    remove,
    save
}

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('order')
        // Sort by most recent bookDate
        var orders = await collection.find(criteria).sort({ bookDate: -1 }).toArray()
        return orders
    } catch (err) {
        logger.error('cannot find orders', err)
        throw err
    }
}

async function getById(orderId) {
    try {
        const collection = await dbService.getCollection('order')
        const order = await collection.findOne({ _id: _toObjectId(orderId) })
        return order
    } catch (err) {
        logger.error(`while finding order ${orderId}`, err)
        throw err
    }
}

async function remove(orderId) {
    try {
        const collection = await dbService.getCollection('order')
        await collection.deleteOne({ _id: _toObjectId(orderId) })
    } catch (err) {
        logger.error(`cannot remove order ${orderId}`, err)
        throw err
    }
}

async function save(order) {
    try {
        const collection = await dbService.getCollection('order')
        if (order._id) {
            const { _id, ...orderToSave } = order
            await collection.updateOne({ _id: _toObjectId(_id) }, { $set: orderToSave })
            return order
        } else {
            order.createdAt = Date.now()
            // Ensure status is pending if not provided
            if (!order.status) order.status = 'pending'
            await collection.insertOne(order)
            return order
        }
    } catch (err) {
        logger.error('cannot save order', err)
        throw err
    }
}

// Private Functions

function _buildCriteria(filterBy) {
    const criteria = {}

    // Filter by buyer (Guest)
    if (filterBy.guestId) {
        criteria['guest._id'] = filterBy.guestId
    }

    // Filter by seller (Host)
    if (filterBy.hostId) {
        criteria['hostId._id'] = filterBy.hostId
    }

    // Filter by Status
    if (filterBy.status) {
        criteria.status = filterBy.status
    }

    // Filter by Stay
    if (filterBy.stayId) {
        criteria['stay._id'] = filterBy.stayId
    }

    return criteria
}

function _toObjectId(id) {
    return ObjectId.isValid(id) ? new ObjectId(id) : id
}