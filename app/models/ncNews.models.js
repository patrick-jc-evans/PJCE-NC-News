const db = require("../../db/index.js")
const format = require("pg-format")

exports.selectTopics = () => {
    return db.query("SELECT * FROM topics").then((dbOutput) => {
        return dbOutput.rows
    })
}

exports.selectArticleFromId = (articleId) => {
    return db
        .query("SELECT * FROM articles WHERE article_id=$1", [articleId])
        .then((dbOutput) => {
            if (dbOutput.rows.length > 0) return dbOutput.rows
            else
                return Promise.reject({
                    status: 404,
                    msg: "No article found for specified id",
                })
        })
}
