import { logger } from './logger.service.js'
import { Server } from 'socket.io'

var gIo = null

export function setupSocketAPI(http) {
    gIo = new Server(http, {
        cors: {
            origin: '*',
        }
    })
    gIo.on('connection', socket => {
        logger.info(`New connected socket [id: ${socket.id}]`)

        socket.on('disconnect', socket => {
            logger.info(`Socket disconnected [id: ${socket.id}]`)
        })

        // Join a chat topic (room)
        socket.on('chat-set-topic', topic => {
            if (socket.myTopic === topic) return
            if (socket.myTopic) {
                socket.leave(socket.myTopic)
                logger.info(`Socket is leaving topic ${socket.myTopic} [id: ${socket.id}]`)
            }
            socket.join(topic)
            socket.myTopic = topic
        })

        // Send a message to the topic
        socket.on('chat-send-msg', msg => {
            logger.info(`New chat msg from socket [id: ${socket.id}], emitting to topic ${socket.myTopic}`)
            // Emit only to sockets in the same room (topic)
            gIo.to(socket.myTopic).emit('chat-add-msg', msg)
        })

        // Handle user login (associate socket with userId)
        socket.on('set-user-socket', userId => {
            logger.info(`Setting socket.userId = ${userId} for socket [id: ${socket.id}]`)
            socket.userId = userId

            if (userId) {
                socket.join(userId)
            }
        })

        // Handle user logout
        socket.on('unset-user-socket', () => {
            logger.info(`Removing socket.userId for socket [id: ${socket.id}]`)
            if (socket.userId) {
                socket.leave(socket.userId)
            }
            delete socket.userId

        })

        // User watch (e.g. for order updates)
        socket.on('user-watch', userId => {
            logger.info(`user-watch ${userId} by socket [id: ${socket.id}]`)
            socket.join('watching:' + userId)
        })
    })
}



// Emits to all sockets or specific room (label)
// Example usage: socketService.emitTo({ type: 'review-added', data: review, label: stayId })
function emitTo({ type, data, label }) {
    if (label) gIo.to('watching:' + label.toString()).emit(type, data)
    else gIo.emit(type, data)
}

// Emits to a specific user (if connected)
async function emitToUser({ type, data, userId }) {
    userId = userId.toString()
    logger.info(`Emiting to user ${userId}: ${type}`)
    gIo.to(userId).emit(type, data)
}

// Can be used to broadcast to all users
async function broadcast({ type, data, room = null, userId }) {
    userId = userId.toString()
    logger.info(`Broadcasting event: ${type}`)
    const excludedSocket = await _getUserSocket(userId)
    if (room && excludedSocket) {
        logger.info(`Broadcast to room ${room} excluding user: ${userId}`)
        excludedSocket.broadcast.to(room).emit(type, data)
    } else if (excludedSocket) {
        logger.info(`Broadcast to all excluding user: ${userId}`)
        excludedSocket.broadcast.emit(type, data)
    } else if (room) {
        logger.info(`Broadcast to room ${room}`)
        gIo.to(room).emit(type, data)
    } else {
        logger.info(`Broadcast to all`)
        gIo.emit(type, data)
    }
}

async function _getUserSocket(userId) {
    const sockets = await gIo.fetchSockets()
    const socket = sockets.find(s => s.userId == userId)
    return socket
}

export const socketService = {
    setupSocketAPI,
    emitTo,
    emitToUser,
    broadcast,
}