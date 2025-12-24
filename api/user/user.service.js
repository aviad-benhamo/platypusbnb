import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { ObjectId } from 'mongodb'

export const userService = {
    query,
    getById,
    getByUsername,
    remove,
    add,
    update
}

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('user')

        // Create default admin user if none exists (Optional dev helper)
        if (await collection.countDocuments() === 0) {
            await _insertDefaultUser(collection)
        }

        var users = await collection.find(criteria).toArray()

        users = users.map(user => {
            delete user.password
            // user.createdAt = new ObjectId(user._id).getTimestamp()
            return user
        })

        return users
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}

async function getById(userId) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ _id: new ObjectId(userId) })
        delete user.password
        return user
    } catch (err) {
        logger.error(`while finding user ${userId}`, err)
        throw err
    }
}

async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ username })
        return user
    } catch (err) {
        logger.error(`while finding user ${username}`, err)
        throw err
    }
}

async function remove(userId) {
    try {
        const collection = await dbService.getCollection('user')
        await collection.deleteOne({ _id: new ObjectId(userId) })
    } catch (err) {
        logger.error(`cannot remove user ${userId}`, err)
        throw err
    }
}

async function add(user) {
    try {
        // Validate that there are no such user:
        const existUser = await getByUsername(user.username)
        if (existUser) throw new Error('Username already taken')

        const userToAdd = {
            username: user.username,
            password: user.password, // This password should be hashed by auth.service before reaching here
            fullname: user.fullname,
            imgUrl: user.imgUrl || '',
            isAdmin: user.isAdmin || false,
            score: 100,
            wishlist: [],
            createdAt: Date.now()
        }

        const collection = await dbService.getCollection('user')
        await collection.insertOne(userToAdd)
        return userToAdd
    } catch (err) {
        logger.error('cannot insert user', err)
        throw err
    }
}

async function update(user) {
    try {
        // Dynamic update - keep all fields sent from frontend except _id
        const { _id, ...userToSave } = user

        const collection = await dbService.getCollection('user')
        await collection.updateOne({ _id: new ObjectId(_id) }, { $set: userToSave })

        return user
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

// --- Private Functions ---

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
        criteria.$or = [
            { username: txtCriteria },
            { fullname: txtCriteria }
        ]
    }
    return criteria
}

async function _insertDefaultUser(collection) {
    const adminUser = {
        fullname: 'System Admin',
        username: 'admin',
        password: 'admin', // Note: In real app, this should be hashed!
        isAdmin: true,
        score: 1000,
        createdAt: Date.now()
    }
    await collection.insertOne(adminUser)
    logger.info('Default admin user created')
}