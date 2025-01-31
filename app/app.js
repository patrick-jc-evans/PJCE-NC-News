const express = require("express")
const app = express()
const apiRouter = require("./routes/apiRouter")
const {
    customErrorStatus,
    sqlErrorCodes,
    internalServerError,
} = require("./appErrors")

app.use(express.json())
app.use("/api", apiRouter)

app.use(customErrorStatus)
app.use(sqlErrorCodes)
app.use(internalServerError)

module.exports = app
