const articles = require("../../db/data/test-data/articles")
const endpoints = require("../../endpoints.json")
const { selectTopics, selectArticleFromId } = require("../models/ncNews.models")

exports.getApi = (req, res, next) => {
    res.status(200).send({ endpoints })
}

exports.getTopics = (req, res, next) => {
    selectTopics().then((topics) => {
        res.status(200).send({ topics })
    })
}

exports.getArticleFromId = (req, res, next) => {
    selectArticleFromId(req.params.article_id)
        .then((article) => {
            res.status(200).send({ article: article[0] })
        })
        .catch((err) => next(err))
}
