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
    test("200: Responds with an array of topics, each with a slug and description", () => {
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

describe("GET /api/articles/article_id", () => {
    test("200: Responds with an article object", () => {
        return request(app)
            .get("/api/articles/1")
            .expect(200)
            .then(({ body: { article } }) => {
                expect(article).toEqual({
                    article_id: 1,
                    title: "Living in the shadow of a great man",
                    topic: "mitch",
                    author: "butter_bridge",
                    body: "I find this existence challenging",
                    created_at: "2020-07-09T20:11:00.000Z",
                    votes: 100,
                    article_img_url:
                        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                })
            })
    })

    test("400: Responds with 400 for an an invalid id", () => {
        return request(app)
            .get("/api/articles/a")
            .expect(400)
            .then((result) => {
                expect(result.body.msg).toBe("Bad Request: Invalid id")
            })
    })

    test("404: Responds with 404 for an id out of range", () => {
        return request(app)
            .get("/api/articles/9999")
            .expect(404)
            .then((result) => {
                expect(result.body.msg).toBe(
                    "No article found for specified id"
                )
            })
    })
})
