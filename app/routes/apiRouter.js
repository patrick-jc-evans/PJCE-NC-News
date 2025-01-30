const { getApi } = require("../controllers/ncNews.controller")
const apiRouter = require("express").Router()
const topicsRouter = require("./topicsRouter")
const articlesRouter = require("./articlesRouter")
const commentsRouter = require("./commentsRouter")
const usersRouter = require("./usersRouter")

apiRouter.use("/topics", topicsRouter)
apiRouter.use("/articles", articlesRouter)
apiRouter.use("/comments", commentsRouter)
apiRouter.use("/users", usersRouter)

apiRouter.get("/", getApi)

module.exports = apiRouter
