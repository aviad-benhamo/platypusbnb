import fs from 'fs'

export const utilService = {
    readJsonFile,
    writeJsonFile,
    makeId
}

function readJsonFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                reject(err)
                return
            }
            resolve(JSON.parse(data))
        })
    })
}

function writeJsonFile(path, data) {
    return new Promise((resolve, reject) => {
        const json = JSON.stringify(data, null, 2)
        fs.writeFile(path, json, (err) => {
            if (err) {
                reject(err)
                return
            }
            resolve()
        })
    })
}

function makeId(length = 5) {
    var txt = ''
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return txt
}