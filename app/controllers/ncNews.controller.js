const articles = require("../../db/data/test-data/articles")
const users = require("../../db/data/test-data/users")
const endpoints = require("../../endpoints.json")
const {
    selectTopics,
    selectArticleFromId,
    selectArticlesWithCommentCount,
    selectArticleComments,
    insertComment,
    updateArticleVotes,
    removeComment,
    selectUsers,
    selectUserFromUsername,
    updateCommentVotes,
    insertArticle,
    insertTopic,
    removeArticle,
} = require("../models/ncNews.models")

exports.getApi = (req, res, next) => {
    res.status(200).send({ endpoints })
}

exports.getTopics = (req, res, next) => {
    selectTopics()
        .then((topics) => {
            res.status(200).send({ topics })
        })
        .catch((err) => next(err))
}

exports.getArticleFromId = (req, res, next) => {
    selectArticleFromId(req.params.article_id)
        .then((article) => {
            res.status(200).send({ article: article[0] })
        })
        .catch((err) => next(err))
}

exports.getArticles = (req, res, next) => {
    let sort_by = "created_at"
    let order = "desc"
    let topic = "any"

    if (req.query.sort_by) sort_by = req.query.sort_by
    if (req.query.order) order = req.query.order
    if (req.query.topic) topic = req.query.topic

    selectArticlesWithCommentCount({
        sort_by,
        order,
        topic,
        limit: req.query.limit,
        p: req.query.p,
    })
        .then((articles) => {
            res.status(200).send({ articles })
        })
        .catch((err) => next(err))
}

exports.getCommentsFromArticle = (req, res, next) => {
    selectArticleComments(req.params.article_id, req.query)
        .then((comments) => {
            res.status(200).send({ comments })
        })
        .catch((err) => next(err))
}

exports.postCommentForArticle = (req, res, next) => {
    const article_id = req.params.article_id
    const { username, body } = req.body

    insertComment({ article_id, username, body })
        .then((comment) => {
            res.status(201).send({ comment })
        })
        .catch((err) => next(err))
}

exports.patchVotesOnArticle = (req, res, next) => {
    const article_id = req.params.article_id
    const { inc_votes } = req.body

    updateArticleVotes(article_id, inc_votes)
        .then((article) => {
            res.status(202).send({ article })
        })
        .catch((err) => next(err))
}

exports.deleteComment = (req, res, next) => {
    const comment_id = req.params.comment_id

    removeComment(comment_id)
        .then(() => {
            res.sendStatus(204)
        })
        .catch((err) => next(err))
}

exports.getUsers = (req, res, next) => {
    selectUsers()
        .then((users) => {
            res.status(200).send({ users })
        })
        .catch((err) => next(err))
}

exports.getUserByUsername = (req, res, next) => {
    const username = req.params.username

    selectUserFromUsername(username)
        .then((user) => {
            res.status(200).send({ user: user[0] })
        })
        .catch((err) => next(err))
}

exports.patchCommentVotes = (req, res, next) => {
    updateCommentVotes(req.params.comment_id, req.body.inc_votes)
        .then((comment) => {
            res.status(202).send({ comment })
        })
        .catch((err) => next(err))
}

exports.postArticle = (req, res, next) => {
    insertArticle(req.body)
        .then((article) => {
            res.status(201).send({ article })
        })
        .catch((err) => {
            next(err)
        })
}

exports.postTopic = (req, res, next) => {
    insertTopic(req.body.slug, req.body.description)
        .then((topic) => {
            res.status(201).send({ topic: topic[0] })
        })
        .catch((err) => {
            next(err)
        })
}

exports.deleteArticle = (req, res, next) => {
    removeArticle(req.params.article_id)
        .then(() => res.sendStatus(204))
        .catch((err) => next(err))
}
