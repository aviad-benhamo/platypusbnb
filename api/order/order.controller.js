import { orderService } from './order.service.js'
import { logger } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'

export async function getOrders(req, res) {
    try {
        const filterBy = {
            hostId: req.query.hostId || '',
            guestId: req.query.guestId || '',
            status: req.query.status || '',
            stayId: req.query.stayId || '',
        }

        const orders = await orderService.query(filterBy)
        res.json(orders)
    } catch (err) {
        logger.error('Failed to get orders', err)
        res.status(500).send({ err: 'Failed to get orders' })
    }
}

export async function getOrderById(req, res) {
    try {
        const orderId = req.params.id
        const order = await orderService.getById(orderId)
        res.json(order)
    } catch (err) {
        logger.error('Failed to get order', err)
        res.status(500).send({ err: 'Failed to get order' })
    }
}

export async function addOrder(req, res) {
    const { loggedinUser } = req
    try {
        const order = req.body
        // Security: Ensure the guest making the order is the logged-in user
        order.guest = { _id: loggedinUser._id, fullname: loggedinUser.fullname, imgUrl: loggedinUser.imgUrl }

        const addedOrder = await orderService.save(order)

        // --- Socket Notification: Notify the Host ---
        if (addedOrder.hostId && addedOrder.hostId._id) {
            socketService.emitToUser({
                type: 'order-added',
                data: addedOrder,
                userId: addedOrder.hostId._id
            })
        }

        res.json(addedOrder)
    } catch (err) {
        logger.error('Failed to add order', err)
        res.status(500).send({ err: 'Failed to add order' })
    }
}

export async function updateOrder(req, res) {
    try {
        const order = req.body
        const updatedOrder = await orderService.save(order)
        res.json(updatedOrder)
    } catch (err) {
        logger.error('Failed to update order', err)
        res.status(500).send({ err: 'Failed to update order' })
    }
}

export async function removeOrder(req, res) {
    try {
        const orderId = req.params.id
        await orderService.remove(orderId)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to remove order', err)
        res.status(500).send({ err: 'Failed to remove order' })
    }
}