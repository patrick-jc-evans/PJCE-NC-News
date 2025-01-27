const express = require("express")
const { getApi, getTopics } = require("./controllers/ncNews.controller")
const app = express()
const port = 9090

app.get("/api", getApi)
app.get("/api/topics", getTopics)

app.use((err, req, res, next) => {
    res.status(500).send({ msg: "Internal server error" })
})

module.exports = app
