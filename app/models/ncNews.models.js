const db = require("../../db/index.js")
const format = require("pg-format")

exports.selectTopics = () => {
    console.log("IN MODEL")

    return db.query("SELECT * FROM topics").then((dbOutput) => {
        if (dbOutput.rows.length > 0) return dbOutput.rows
        else return Promise.reject({ status: 418 })
    })
}
