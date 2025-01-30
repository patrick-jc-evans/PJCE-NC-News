const {
    getTopics,
    getArticles,
    getArticleFromId,
    getCommentsFromArticle,
    postCommentForArticle,
    patchVotesOnArticle,
} = require("../controllers/ncNews.controller")

const articlesRouter = require("express").Router()

articlesRouter.get("/", getArticles)
articlesRouter.get("/:article_id", getArticleFromId)
articlesRouter.get("/:article_id/comments", getCommentsFromArticle)
articlesRouter.post("/:article_id/comments", postCommentForArticle)
articlesRouter.patch("/:article_id", patchVotesOnArticle)

module.exports = articlesRouter
