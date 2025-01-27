const endpoints = require("../../endpoints.json")
const { selectTopics } = require("../models/ncNews.models")

exports.getApi = (req, res, next) => {
    res.status(200).send({ endpoints })
}

exports.getTopics = (req, res, next) => {
    selectTopics().then((topics) => {
        res.status(200).send({ topics })
    })
}
