exports.customErrorStatus = (err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg })
    } else next(err)
}

exports.sqlErrorCodes = (err, req, res, next) => {
    if (err.code === "22P02") {
        res.status(400).send({ msg: "Bad Request: Invalid Body" })
    }
    if (err.code === "23503") {
        res.status(404).send({ msg: "Parameter out of range" })
    }
}

exports.internalServerError = (err, req, res, next) => {
    res.status(500).send({ msg: "Internal server error" })
}
