const endpointsJson = require("../endpoints.json")
/* Set up your test imports here */
const db = require("../db/connection.js")
const request = require("supertest")
const app = require("../app/app.js")
const seed = require("../db/seeds/seed.js")
const testData = require("../db/data/test-data/index.js")
const comments = require("../db/data/test-data/comments.js")

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

describe("GET /api/articles", () => {
    test("200: Responds with an array of expected article objects", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .then((articles) => {
                articlesArray = articles.body.articles

                // Check the keys
                articlesArray.forEach((article) =>
                    expect(Object.keys(article)).toEqual([
                        "author",
                        "title",
                        "article_id",
                        "topic",
                        "created_at",
                        "votes",
                        "article_img_url",
                        "comment_count",
                    ])
                )

                // Check the articles are sorted by date.
                for (let i = 0; i < articlesArray.length - 2; i++) {
                    expect(
                        articlesArray[i].created_at <
                            articlesArray[i + 1].created_at
                    )
                }

                // Check the first article has all expected data
                expect(articlesArray[0]).toEqual({
                    author: "icellusedkars",
                    title: "Eight pug gifs that remind me of mitch",
                    article_id: 3,
                    topic: "mitch",
                    created_at: "2020-11-03T09:12:00.000Z",
                    votes: 0,
                    article_img_url:
                        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                    comment_count: "2",
                })
            })
    })
})
