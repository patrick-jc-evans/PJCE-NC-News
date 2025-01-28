const express = require("express")
const {
    getApi,
    getTopics,
    getArticleFromId,
    getArticles,
    getCommentsFromArticle,
    postCommentForArticle,
    pathVotesOnArticle,
    deleteComment,
    getUsers,
} = require("./controllers/ncNews.controller")
const app = express()

app.use(express.json())

app.get("/api", getApi)
app.get("/api/topics", getTopics)
app.get("/api/articles/:article_id", getArticleFromId)
app.get("/api/articles", getArticles)
app.get("/api/articles/:article_id/comments", getCommentsFromArticle)
app.post("/api/articles/:article_id/comments", postCommentForArticle)
app.patch("/api/articles/:article_id", pathVotesOnArticle)
app.delete("/api/comments/:comment_id", deleteComment)
app.get("/api/users", getUsers)

app.use((err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg })
    } else next(err)
})

app.use((err, req, res, next) => {
    if (err.code === "22P02") {
        res.status(400).send({ msg: "Bad Request: Invalid Body" })
    }
    if (err.code === "23503") {
        res.status(404).send({ msg: "Parameter out of range" })
    }
})

app.use((err, req, res, next) => {
    res.status(500).send({ msg: "Internal server error" })
})

module.exports = app
