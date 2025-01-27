const express = require("express")
const {
    getApi,
    getTopics,
    getArticleFromId,
    getArticles,
} = require("./controllers/ncNews.controller")
const app = express()

app.get("/api", getApi)
app.get("/api/topics", getTopics)
app.get("/api/articles/:article_id", getArticleFromId)
app.get("/api/articles", getArticles)

app.use((err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg })
    } else next(err)
})

app.use((err, req, res, next) => {
    if (err.code === "22P02") {
        res.status(400).send({ msg: "Bad Request: Invalid id" })
    }
})

app.use((err, req, res, next) => {
    res.status(500).send({ msg: "Internal server error" })
})

module.exports = app
