const endpointsJson = require("../endpoints.json")
/* Set up your test imports here */
const db = require("../db/connection.js")
const request = require("supertest")
const app = require("../app/app.js")
const seed = require("../db/seeds/seed.js")
const testData = require("../db/data/test-data/index.js")

/* Set up your beforeEach & afterAll functions here */
beforeEach(() => {
    return seed(testData)
})
afterAll(() => db.end())

describe("GET /api", () => {
    test("200: Responds with an object detailing the documentation for each endpoint", () => {
        return request(app)
            .get("/api")
            .expect(200)
            .then(({ body: { endpoints } }) => {
                expect(endpoints).toEqual(endpointsJson)
            })
    })
})

describe("GET /api/topics", () => {
    test("200 Responds with an array of topics, each with a slug and description", () => {
        return request(app)
            .get("/api/topics")
            .expect(200)
            .then(({ body: { topics } }) => {
                expect(topics).toEqual([
                    {
                        slug: "mitch",
                        description: "The man, the Mitch, the legend",
                    },
                    { slug: "cats", description: "Not dogs" },
                    { slug: "paper", description: "what books are made of" },
                ])
            })
    })
})
