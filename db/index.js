const { Pool } = require("pg")
const { NODE_ENV } = process.env
// handle using the correct environment variables here
require("dotenv").config({
    path: `${__dirname}/../.env.${NODE_ENV}`,
})

if (!process.env.PGDATABASE) {
    throw new Error("PGDATABASE not set")
}

module.exports = new Pool()
