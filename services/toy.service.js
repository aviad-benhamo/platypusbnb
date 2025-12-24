import { utilService } from './util.service.js'

const TOYS_PATH = './data/toys.json'

const labels = ['On wheels', 'Box game', 'Art', 'Baby', 'Doll', 'Puzzle', 'Outdoor', 'Battery Powered']

export const toyService = {
    query,
    getById,
    remove,
    save
}

function query(filterBy = {}) {
    return utilService.readJsonFile(TOYS_PATH)
        .then(toys => {
            if (!toys || !toys.length) {
                toys = _createToys()
                utilService.writeJsonFile(TOYS_PATH, toys)
            }

            // 1. Filter by Name (Search)
            if (filterBy.name) {
                const regExp = new RegExp(filterBy.name, 'i')
                toys = toys.filter(toy => regExp.test(toy.name))
            }

            // 2. Filter by In Stock
            if (filterBy.inStock !== undefined && filterBy.inStock !== '') {
                const isInStock = filterBy.inStock === 'true'
                toys = toys.filter(toy => toy.inStock === isInStock)
            }

            // 3. Filter by Labels
            if (filterBy.labels) {
                const labelsToFilter = Array.isArray(filterBy.labels)
                    ? filterBy.labels
                    : filterBy.labels.split(',')

                toys = toys.filter(toy =>
                    toy.labels && toy.labels.some(label => labelsToFilter.includes(label))
                )
            }

            // 4. Sorting
            if (filterBy.sortBy) {
                if (filterBy.sortBy === 'name') {
                    toys.sort((t1, t2) => t1.name.localeCompare(t2.name))
                } else if (filterBy.sortBy === 'price') {
                    toys.sort((t1, t2) => t1.price - t2.price)
                } else if (filterBy.sortBy === 'createdAt') {
                    toys.sort((t1, t2) => t1.createdAt - t2.createdAt)
                }
            }
            return toys
        })
}

function getById(toyId) {
    return utilService.readJsonFile(TOYS_PATH)
        .then(toys => {
            const toy = toys.find(toy => toy._id === toyId)
            if (!toy) throw new Error(`Toy id ${toyId} not found`)
            return toy
        })
}

function remove(toyId) {
    return utilService.readJsonFile(TOYS_PATH)
        .then(toys => {
            const idx = toys.findIndex(toy => toy._id === toyId)
            if (idx === -1) throw new Error(`Toy id ${toyId} not found`)
            toys.splice(idx, 1)
            return utilService.writeJsonFile(TOYS_PATH, toys)
        })
}

function save(toy) {
    return utilService.readJsonFile(TOYS_PATH)
        .then(toys => {
            if (toy._id) {
                const idx = toys.findIndex(currToy => currToy._id === toy._id)
                if (idx === -1) throw new Error(`Toy id ${toy._id} not found`)
                toy.createdAt = toys[idx].createdAt
                toys[idx] = toy
            } else {
                toy._id = utilService.makeId()
                toy.createdAt = Date.now()
                if (!toy.imgUrl) {
                    toy.imgUrl = `https://robohash.org/${toy.name}?set=set4`
                }
                if (toy.inStock === undefined) toy.inStock = true
                if (!toy.labels) toy.labels = []

                toys.push(toy)
            }
            return utilService.writeJsonFile(TOYS_PATH, toys)
                .then(() => toy)
        })
}

function _createToys() {
    return [
        _createToy('Talking Doll', 123, ['Doll', 'Battery Powered', 'Baby']),
        _createToy('Remote Car', 50, ['On wheels', 'Battery Powered']),
        _createToy('Puzzle Box', 35, ['Box game', 'Puzzle']),
        _createToy('Teddy Bear', 80, ['Doll', 'Baby']),
        _createToy('Art Kit', 45, ['Art']),
        _createToy('Talking Doll', 123, ['Doll', 'Battery Powered', 'Baby']),
        _createToy('Remote Car', 50, ['On wheels', 'Battery Powered']),
        _createToy('Puzzle Box', 35, ['Box game', 'Puzzle']),
        _createToy('Teddy Bear', 80, ['Doll', 'Baby']),
        _createToy('Art Kit', 45, ['Art']),
        _createToy('Outdoor Ball', 25, ['Outdoor']),
        _createToy('Racer Bike', 300, ['On wheels', 'Outdoor']),
        _createToy('Building Blocks', 60, ['Baby', 'Puzzle']),
    ]
}

function _createToy(name, price, labels) {
    return {
        _id: utilService.makeId(),
        name,
        price,
        labels,
        createdAt: Date.now(),
        inStock: Math.random() > 0.3,
        imgUrl: `https://robohash.org/${name.replace(/\s+/g, '-')}?set=set4`
    }
}