const { deleteComment } = require("../controllers/ncNews.controller")

const commentsRouter = require("express").Router()

commentsRouter.delete("/:comment_id", deleteComment)

module.exports = commentsRouter
