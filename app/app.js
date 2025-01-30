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

const apiRouter = require("./routes/apiRouter")

app.use(express.json())

app.use("/api", apiRouter)

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
