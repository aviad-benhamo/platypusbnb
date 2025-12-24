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

        //create default admin user if none exists
        if (await collection.countDocuments() === 0) {
            await _insertDefaultUser(collection)
        }

        var users = await collection.find(criteria).toArray()

        users = users.map(user => {
            delete user.password
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
        const { username, password, fullname } = user
        if (!username || !password || !fullname) throw new Error('Missing required fields')

        const collection = await dbService.getCollection('user')

        const userExist = await collection.findOne({ username })
        if (userExist) throw new Error('Username already exists')

        const userToAdd = {
            username,
            password, // bcrypt
            fullname,
            isAdmin: user.isAdmin || false,
            score: user.score || 0,
            createdAt: Date.now()
        }

        await collection.insertOne(userToAdd)
        return userToAdd
    } catch (err) {
        logger.error('cannot insert user', err)
        throw err
    }
}

async function update(user) {
    try {
        const userToSave = {
            _id: new ObjectId(user._id),
            fullname: user.fullname,
            score: user.score
        }
        const collection = await dbService.getCollection('user')
        await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
        return userToSave
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

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
        fullname: 'Master Admin',
        username: 'admin',
        password: '123',
        isAdmin: true,
        score: 1000,
        createdAt: Date.now()
    }
    await collection.insertOne(adminUser)
    logger.info('Created Default Admin User')
}