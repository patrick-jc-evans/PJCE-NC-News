// const { promises } = require("supertest/lib/test.js")
const db = require("../../db/connection.js")
const format = require("pg-format")

checkArticleIdExists = (article_id) => {
    return db
        .query("SELECT COUNT(*) FROM articles WHERE article_id = $1", [
            article_id,
        ])
        .then((check) => {
            if (Number(check.rows[0].count) > 0) {
                // Returns to end the promise, output is not needed
                return undefined
            } else {
                // Sends into .catch block
                return Promise.reject({
                    status: 404,
                    msg: "No article found for specified id",
                })
            }
        })
        .catch((err) => {
            if (err.status === 404) {
                return Promise.reject(err)
            }

            return Promise.reject({
                status: 400,
                msg: "Bad Request: Invalid article id",
            })
        })
}

checkCommentIdExists = (comment_id) => {
    return db
        .query("SELECT COUNT(*) FROM comments WHERE comment_id = $1", [
            comment_id,
        ])
        .then((check) => {
            if (Number(check.rows[0].count) > 0) {
                // Returns to end the promise, output is not needed
                return undefined
            } else {
                // Sends into .catch block
                return Promise.reject({
                    status: 404,
                    msg: "No comment found for specified id",
                })
            }
        })
        .catch((err) => {
            if (err.status === 404) {
                return Promise.reject(err)
            }

            return Promise.reject({
                status: 400,
                msg: "Bad Request: Invalid comment id",
            })
        })
}

checkTopicExists = (topic_name) => {
    return db
        .query("SELECT COUNT(*) FROM topics WHERE slug = $1", [topic_name])
        .then((check) => {
            if (Number(check.rows[0].count) > 0 || topic_name === "any") {
                // Returns to end the promise, output is not needed
                return undefined
            } else {
                // Sends into .catch block
                return Promise.reject({
                    status: 404,
                    msg: "No topic found for specified topic_name",
                })
            }
        })
        .catch((err) => {
            if (err.status === 404) {
                return Promise.reject(err)
            }

            return Promise.reject({
                status: 400,
                msg: "Bad Request: Invalid topic name",
            })
        })
}

checkUserExists = (username) => {
    return db
        .query("SELECT COUNT(*) FROM users WHERE username = $1", [username])
        .then((check) => {
            if (Number(check.rows[0].count) > 0) {
                // Returns to end the promise, output is not needed
                return undefined
            } else {
                // Sends into .catch block
                return Promise.reject({
                    status: 404,
                    msg: "No user found for specified username",
                })
            }
        })
        .catch((err) => {
            if (err.status === 404) {
                return Promise.reject(err)
            }

            return Promise.reject({
                status: 400,
                msg: "Bad Request: Invalid username name",
            })
        })
}

exports.selectTopics = () => {
    return db.query("SELECT * FROM topics").then((dbOutput) => {
        return dbOutput.rows
    })
}

exports.selectArticleFromId = (articleId) => {
    return checkArticleIdExists(articleId).then(() => {
        const queryStr = format(
            `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.body ,articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id)
                AS comment_count
                FROM comments 
                RIGHT JOIN articles ON (comments.article_id = articles.article_id) 
                WHERE articles.article_id = '%s'
                GROUP BY articles.article_id`,
            [articleId]
        )

        return db.query(queryStr).then((dbOutput) => {
            return dbOutput.rows
        })
    })
}

exports.selectArticlesWithCommentCount = (args) => {
    if (args.order !== "asc" && args.order !== "desc")
        return Promise.reject({
            status: 400,
            msg: "Bad Request: Invalid order query",
        })

    const validSorts = [
        "author",
        "title",
        "article_id",
        "topic",
        "created_at",
        "votes",
        "comment_count",
    ]

    if (!validSorts.includes(args.sort_by))
        return Promise.reject({
            status: 400,
            msg: "Bad Request: Invalid sort_by query",
        })

    return checkTopicExists(args.topic).then(() => {
        let queryStr

        if (args.topic !== "any") {
            queryStr = format(
                `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id)
                AS comment_count 
                FROM comments 
                RIGHT JOIN articles ON (comments.article_id = articles.article_id) 
                WHERE articles.topic = '%s'
                GROUP BY articles.article_id
                ORDER BY %s %s`,
                args.topic,
                args.sort_by,
                args.order
            )
        } else {
            queryStr = format(
                `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id)
                AS comment_count
                FROM comments 
                RIGHT JOIN articles ON (comments.article_id = articles.article_id) 
                GROUP BY articles.article_id
                ORDER BY %s %s`,
                args.sort_by,
                args.order
            )
        }

        if (!isNaN(Number(args.limit))) {
            queryStr += ` LIMIT ${args.limit}`
            if (!isNaN(Number(args.p))) {
                queryStr += ` OFFSET ${(args.p - 1) * args.limit}`
            } else if (args.p !== undefined) {
                return Promise.reject({
                    status: 400,
                    msg: "Invalid query for pages",
                })
            }
        } else if (args.limit !== undefined) {
            return Promise.reject({
                status: 400,
                msg: "Invalid query for limit",
            })
        }

        return db.query(queryStr).then((dbOutput) => {
            return dbOutput.rows
        })
    })
}

exports.selectArticleComments = (articleId, queries) => {
    let queryExtention = ""

    if (!isNaN(Number(queries.limit))) {
        queryExtention += ` LIMIT ${queries.limit}`
        if (!isNaN(Number(queries.p))) {
            queryExtention += ` OFFSET ${(queries.p - 1) * queries.limit}`
        } else if (queries.p !== undefined) {
            return Promise.reject({
                status: 400,
                msg: "Invalid query for pages",
            })
        }
    } else if (queries.limit !== undefined) {
        return Promise.reject({
            status: 400,
            msg: "Invalid query for limit",
        })
    }

    return checkArticleIdExists(articleId).then(() => {
        return db
            .query("SELECT * FROM articles WHERE article_id = $1", [articleId])
            .then(() => {
                return db
                    .query(
                        "SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at desc" +
                            queryExtention +
                            ";",
                        [articleId]
                    )
                    .then((dbOutput) => {
                        return dbOutput.rows
                    })
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

    return checkArticleIdExists(article_id).then(() => {
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
    })
}

exports.updateArticleVotes = (article_id, vote_change) => {
    return checkArticleIdExists(article_id).then(() => {
        return db
            .query("SELECT votes FROM articles WHERE article_id = $1", [
                article_id,
            ])
            .then((dbOutput) => {
                const newVotes = dbOutput.rows[0].votes + vote_change
                return db
                    .query(
                        "UPDATE articles SET votes = $1 WHERE article_id = $2 RETURNING *",
                        [newVotes, article_id]
                    )
                    .then((dbOutput) => {
                        return dbOutput.rows[0]
                    })
            })
    })
}

exports.removeComment = (commentId) => {
    return checkCommentIdExists(commentId).then(() => {
        return db.query("DELETE FROM comments WHERE comment_id = $1", [
            commentId,
        ])
    })
}

exports.selectUsers = () => {
    return db.query("SELECT * FROM users").then((dbOutput) => {
        return dbOutput.rows
    })
}

exports.selectUserFromUsername = (username) => {
    return checkUserExists(username).then(() => {
        return db
            .query("SELECT * FROM users WHERE username = $1", [username])
            .then((dbOutput) => {
                return dbOutput.rows
            })
    })
}

exports.updateCommentVotes = (commentId, vote_change) => {
    if (vote_change === undefined) {
        return Promise.reject({ code: "22P02" })
    }

    return checkCommentIdExists(commentId).then(() => {
        return db
            .query(
                "UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *",
                [vote_change, commentId]
            )
            .then((dbOutput) => {
                return dbOutput.rows[0]
            })
    })
}

exports.insertArticle = (postBody) => {
    if (!postBody.article_img_url) {
        postBody.article_img_url =
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
    }

    const requiredKeys = ["author", "title", "body", "topic", "article_img_url"]
    for (let key of requiredKeys) {
        if (!postBody[key]) {
            return Promise.reject({
                status: 400,
                msg: "Bad Request: Article missing required properties",
            })
        }
    }

    const { author, title, body, topic, article_img_url } = postBody
    const created_at = new Date()

    const insertStr = format(
        "INSERT INTO articles (title, topic, author, body, created_at, votes, article_img_url) VALUES %L RETURNING *",
        [[title, topic, author, body, created_at, 0, article_img_url]]
    )

    return db
        .query("SELECT * FROM users WHERE username = $1", [author])
        .then((user) => {
            if (user.rows.length === 0) {
                return Promise.reject({
                    status: 400,
                    msg: "Bad Request: Author does not exist in database",
                })
            } else {
                return db
                    .query("SELECT * FROM topics WHERE slug = $1", [topic])
                    .then((topic) => {
                        if (topic.rows.length === 0) {
                            return Promise.reject({
                                status: 400,
                                msg: "Bad Request: Topic does not exist in database",
                            })
                        } else {
                            return db.query(insertStr).then((newArticle) => {
                                return newArticle.rows[0]
                            })
                        }
                    })
            }
        })
}

exports.insertTopic = (slug, description) => {
    if (!slug || !description) {
        return Promise.reject({
            status: 400,
            msg: "Property missing from body",
        })
    }

    return db
        .query("SELECT * FROM topics WHERE slug = $1", [slug])
        .then((topic) => {
            if (topic.rows.length === 0) {
                const insertStr = format(
                    "INSERT INTO topics (slug, description) VALUES %L RETURNING *",
                    [[slug, description]]
                )
                return db.query(insertStr).then((newTopic) => {
                    return newTopic.rows
                })
            } else {
                return Promise.reject({
                    status: 400,
                    msg: "Bad Request: A topic with that slug already exists",
                })
            }
        })
}

exports.removeArticle = (articleId) => {
    return checkArticleIdExists(articleId).then(() => {
        return db
            .query("DELETE FROM comments WHERE article_id = $1", [articleId])
            .then(() => {
                return db.query("DELETE FROM articles WHERE article_id = $1", [
                    articleId,
                ])
            })
    })
}
