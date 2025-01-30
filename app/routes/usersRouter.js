const { getUsers } = require("../controllers/ncNews.controller")

const usersRouter = require("express").Router()

usersRouter.get("/", getUsers)

module.exports = usersRouter
