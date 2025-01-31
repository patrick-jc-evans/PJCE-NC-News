const {
    getUsers,
    getUserByUsername,
} = require("../controllers/ncNews.controller")

const usersRouter = require("express").Router()

usersRouter.get("/", getUsers)
usersRouter.get("/:username", getUserByUsername)

module.exports = usersRouter
