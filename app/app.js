const express = require("express")
const { getApi } = require("./controllers/ncNews.controller")
const app = express()
const port = 9090

app.use("/api", getApi)

const server = app.listen(port, () => {
    console.log(`app.js is listening on port ${port}`)
})

module.exports = server
