const express = require("express")
const { getApi, getTopics } = require("./controllers/ncNews.controller")
const app = express()
const port = 9090

app.get("/api", getApi)
app.get("/api/topics", getTopics)

module.exports = app
