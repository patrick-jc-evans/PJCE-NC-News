const e = require("express")
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

exports.selectArticlesWithCommentCount = () => {
    return db
        .query(
            `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id)
            AS comment_count 
            FROM comments 
            RIGHT JOIN articles ON (comments.article_id = articles.article_id) 
            GROUP BY articles.article_id
            ORDER BY created_at desc`
        )
        .then((dbOutput) => {
            return dbOutput.rows
        })
}

exports.selectArticleComments = (articleId) => {
    return db
        .query(
            "SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at desc",
            [articleId]
        )
        .then((dbOutput) => {
            if (dbOutput.rows.length > 0) return dbOutput.rows
            else
                return Promise.reject({
                    status: 404,
                    msg: "No article found for specified id",
                })
        })
}

exports.insertComment = (postInfo) => {
    const { username, body, article_id } = postInfo
    const date = new Date()

    if (username === undefined || body === undefined) {
        return Promise.reject({
            status: 400,
            msg: "Bad Request: Comment missing required properties",
        })
    }

    const insertStr = format(
        "INSERT INTO comments (author, body, article_id, votes, created_at) VALUES %L RETURNING *",
        [[username, body, article_id, 0, date]]
    )

    return db
        .query("SELECT * FROM users WHERE username = $1", [username])
        .then((user) => {
            if (user.rows.length === 0) {
                return Promise.reject({
                    status: 400,
                    msg: "Bad Request: User does not exist",
                })
            } else {
                return db.query(insertStr).then((dbOutput) => {
                    return dbOutput.rows
                })
            }
        })
}
