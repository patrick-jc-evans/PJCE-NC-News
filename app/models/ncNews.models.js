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
