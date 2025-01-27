const express = require("express")
const { getApi } = require("./controllers/ncNews.controller")
const app = express()
const port = 9090

app.use("/api", getApi)

module.exports = app
