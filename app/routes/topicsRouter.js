const { getTopics } = require("../controllers/ncNews.controller")

const topicsRouter = require("express").Router()

topicsRouter.get("/", getTopics)

module.exports = topicsRouter
