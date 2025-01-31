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
                    comment_count: "11",
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
                expect(result.body.msg).toBe("Bad Request: Invalid article id")
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

describe("GET /api/articles/:article_id/comments", () => {
    test("200: Responds with an array of comments for a given article id", () => {
        return request(app)
            .get("/api/articles/1/comments")
            .expect(200)
            .then((result) => {
                commentsArray = result.body.comments
                // Check exact value of first comment
                expect(commentsArray[0]).toEqual({
                    comment_id: 5,
                    body: "I hate streaming noses",
                    article_id: 1,
                    author: "icellusedkars",
                    votes: 0,
                    created_at: "2020-11-03T21:00:00.000Z",
                })

                // Check order of comments is correct
                for (let i = 0; i < commentsArray.length - 2; i++) {
                    expect(
                        commentsArray[i].created_at <
                            commentsArray[i + 1].created_at
                    )
                }

                // Check expected number of comments present
                expect(commentsArray.length).toBe(11)
            })
    })

    test("200: Responds with 200 and an empty array of comments for an article with no comments", () => {
        return request(app)
            .get("/api/articles/2/comments")
            .expect(200)
            .then((result) => {
                expect(result.body.comments).toEqual([])
            })
    })

    test("400: Responds with 400 for an an invalid id", () => {
        return request(app)
            .get("/api/articles/a/comments")
            .expect(400)
            .then((result) => {
                expect(result.body.msg).toBe("Bad Request: Invalid article id")
            })
    })

    test("404: Responds with 404 for an id out of range", () => {
        return request(app)
            .get("/api/articles/9999/comments")
            .expect(404)
            .then((result) => {
                expect(result.body.msg).toBe(
                    "No article found for specified id"
                )
            })
    })
})

describe("POST api/articles/:article_id/comments", () => {
    test("201: Responds with 201 when a comment is successfully added", () => {
        return request(app)
            .post("/api/articles/1/comments")
            .send({ username: "butter_bridge", body: "This is a comment" })
            .expect(201)
            .then((result) => {
                expect(result.body.comment[0]).toEqual({
                    comment_id: 19,
                    body: "This is a comment",
                    article_id: 1,
                    author: "butter_bridge",
                    votes: 0,

                    // Date will change each time the test is ran.
                    created_at: result.body.comment[0].created_at,
                })
            })
    })

    test("400: Responds with a 400 when the username in a post request does not exist", () => {
        return request(app)
            .post("/api/articles/1/comments")
            .send({ username: "kev", body: "This is a comment" })
            .expect(400)
            .then((result) => {
                expect(result.body.msg).toBe("Bad Request: User does not exist")
            })
    })

    test("400: Responds with a 400 when request is missing a property (username)", () => {
        return request(app)
            .post("/api/articles/1/comments")
            .send({ body: "This is a comment with no username (name)" })
            .expect(400)
            .then((result) => {
                expect(result.body.msg).toBe(
                    "Bad Request: Comment missing required properties"
                )
            })
    })

    test("400: Responds with a 400 when request is missing a property (body)", () => {
        return request(app)
            .post("/api/articles/1/comments")
            .send({ username: "butter_bridge" })
            .expect(400)
            .then((result) => {
                expect(result.body.msg).toBe(
                    "Bad Request: Comment missing required properties"
                )
            })
    })

    test("400: Responds with a 400 for an invalid article_id format", () => {
        return request(app)
            .post("/api/articles/a/comments")
            .send({ username: "butter_bridge", body: "This is a comment" })
            .expect(400)
            .then((result) => {
                expect(result.body.msg).toBe("Bad Request: Invalid article id")
            })
    })
    test("404: Responds with a 404 for an article_id that doesn't exist", () => {
        return request(app)
            .post("/api/articles/9999/comments")
            .send({ username: "butter_bridge", body: "This is a comment" })
            .expect(404)
            .then((result) => {
                expect(result.body.msg).toBe(
                    "No article found for specified id"
                )
            })
    })
})

describe("PATCH api/articles/:article_id", () => {
    test("202: Responds with the updated article (positive votes)", () => {
        return request(app)
            .patch("/api/articles/1")
            .send({ inc_votes: 10 })
            .expect(202)
            .then((result) => {
                expect(result.body.article).toEqual({
                    article_id: 1,
                    article_img_url:
                        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                    author: "butter_bridge",
                    body: "I find this existence challenging",
                    created_at: "2020-07-09T20:11:00.000Z",
                    title: "Living in the shadow of a great man",
                    topic: "mitch",
                    votes: 110,
                })
            })
    })
    test("202: Responds with the updated article (negative votes)", () => {
        return request(app)
            .patch("/api/articles/1")
            .send({ inc_votes: -5 })
            .expect(202)
            .then((result) => {
                expect(result.body.article).toEqual({
                    article_id: 1,
                    article_img_url:
                        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                    author: "butter_bridge",
                    body: "I find this existence challenging",
                    created_at: "2020-07-09T20:11:00.000Z",
                    title: "Living in the shadow of a great man",
                    topic: "mitch",
                    votes: 95,
                })
            })
    })

    test("400: Responds with a 400 for a body with no inc_votes property", () => {
        return request(app)
            .patch("/api/articles/1")
            .send({ banana: "10" })
            .expect(400)
            .then((result) => {
                expect(result.body.msg).toBe("Bad Request: Invalid Body")
            })
    })

    test("400: Responds with a 400 for an invalid inc_votes value", () => {
        return request(app)
            .patch("/api/articles/1")
            .send({ inc_votes: "abc" })
            .expect(400)
            .then((result) => {
                expect(result.body.msg).toBe("Bad Request: Invalid Body")
            })
    })

    test("400: Responds with a 400 for an invalid article_id format", () => {
        return request(app)
            .patch("/api/articles/a")
            .send({ inc_votes: 10 })
            .expect(400)
            .then((result) => {
                expect(result.body.msg).toBe("Bad Request: Invalid article id")
            })
    })
    test("404: Responds with a 404 for an article_id that doesn't exist", () => {
        return request(app)
            .patch("/api/articles/9999")
            .send({ inc_votes: 10 })
            .expect(404)
            .then((result) => {
                expect(result.body.msg).toBe(
                    "No article found for specified id"
                )
            })
    })
})

describe("DELETE api/comments/comment_id", () => {
    test("204: Responds with 204 after deleting a comment with a given id.", () => {
        return request(app)
            .delete("/api/comments/1")
            .expect(204)
            .then(() => {
                return db
                    .query("SELECT * FROM comments WHERE comment_id = 1")
                    .then((dbOutput) => expect(dbOutput.rows).toEqual([]))
            })
        //Check comment id 1 is definitely gone from the database:
    })
    test("400: Responds with 400 for an invalid id", () => {
        return request(app).delete("/api/comments/a").expect(400)
    })
    test("404: Responds with 404 for an id that doesn't exist.", () => {
        return request(app).delete("/api/comments/999").expect(404)
    })
})

describe("GET/api/users", () => {
    test("200: Responds with an array of all users", () => {
        return request(app)
            .get("/api/users")
            .expect(200)
            .then((result) => {
                const userArray = result.body.users

                expect(userArray.length).toBe(4)
                expect(userArray[0]).toEqual({
                    username: "butter_bridge",
                    name: "jonny",
                    avatar_url:
                        "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
                })
            })
    })
})

describe("GET /api/articles [Sorting Queries]", () => {
    test("200: Responds with an array of all articles, defaulting to created_at desc", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .then((articles) => {
                const articlesArray = articles.body.articles

                // Check the articles are sorted by decending date by default.
                for (let i = 0; i < articlesArray.length - 2; i++) {
                    expect(
                        articlesArray[i].created_at <
                            articlesArray[i + 1].created_at
                    )
                }
            })
    })

    test("200: Responds with an array of all articles ordered by asc, defaulting to created_at", () => {
        return request(app)
            .get("/api/articles?order=asc")
            .expect(200)
            .then((articles) => {
                const articlesArray = articles.body.articles

                // Check the articles are sorted by decending date by defauly.
                for (let i = 0; i < articlesArray.length - 2; i++) {
                    expect(
                        articlesArray[i].created_at >
                            articlesArray[i + 1].created_at
                    )
                }
            })
    })

    test("200: Responds with all articles sorted by number of comments", () => {
        return request(app)
            .get("/api/articles?sort_by=comment_count")
            .expect(200)
            .then((articles) => {
                const articlesArray = articles.body.articles

                // Check the articles are sorted by decending date by defauly.
                for (let i = 0; i < articlesArray.length - 2; i++) {
                    expect(
                        articlesArray[i].comment_count <
                            articlesArray[i + 1].comment_count
                    )
                }
            })
    })

    test("200: Responds with all articles sorted by author asc", () => {
        return request(app)
            .get("/api/articles?sort_by=author&order=asc")
            .expect(200)
            .then((articles) => {
                const authorArray = articles.body.articles.map(
                    (article) => article.author
                )
                expect(authorArray).toEqual(authorArray.toSorted())
            })
    })

    test("200: Responds with all articles sorted by author desc", () => {
        return request(app)
            .get("/api/articles?sort_by=author&order=desc")
            .expect(200)
            .then((articles) => {
                const authorArray = articles.body.articles.map(
                    (article) => article.author
                )
                expect(authorArray).toEqual(authorArray.toSorted().reverse())
            })
    })

    test("200: Responds with all articles sorted by title asc", () => {
        return request(app)
            .get("/api/articles?sort_by=title&order=asc")
            .expect(200)
            .then((articles) => {
                const titleArray = articles.body.articles.map(
                    (article) => article.title
                )
                expect(titleArray).toEqual(titleArray.toSorted())
            })
    })

    test("200: Responds with all articles sorted by title desc", () => {
        return request(app)
            .get("/api/articles?sort_by=title&order=desc")
            .expect(200)
            .then((articles) => {
                const titleArray = articles.body.articles.map(
                    (article) => article.title
                )
                expect(titleArray).toEqual(titleArray.toSorted().reverse())
            })
    })

    test("200: Responds with all articles sorted by votes asc", () => {
        return request(app)
            .get("/api/articles?sort_by=votes&order=asc")
            .expect(200)
            .then((articles) => {
                const votesArray = articles.body.articles.map(
                    (article) => article.votes
                )
                expect(votesArray).toEqual(votesArray.toSorted((a, b) => a - b))
            })
    })

    test("200: Responds with all articles sorted by votes desc", () => {
        return request(app)
            .get("/api/articles?sort_by=votes&order=desc")
            .expect(200)
            .then((articles) => {
                const votesArray = articles.body.articles.map(
                    (article) => article.votes
                )
                expect(votesArray).toEqual(votesArray.toSorted((a, b) => b - a))
            })
    })

    test("200: Responds with all articles sorted by number of comments asc", () => {
        return request(app)
            .get("/api/articles?sort_by=comment_count&order=asc")
            .expect(200)
            .then((articles) => {
                const commentCountArray = articles.body.articles.map(
                    (article) => article.comment_count
                )
                expect(commentCountArray).toEqual(
                    commentCountArray.toSorted((a, b) => a - b)
                )
            })
    })

    test("200: Responds with all articles sorted by number of comments desc", () => {
        return request(app)
            .get("/api/articles?sort_by=comment_count&order=desc")
            .expect(200)
            .then((articles) => {
                const commentCountArray = articles.body.articles.map(
                    (article) => article.comment_count
                )
                expect(commentCountArray).toEqual(
                    commentCountArray.toSorted((a, b) => b - a)
                )
            })
    })

    test("200: Responds with all articles sorted by topics asc", () => {
        return request(app)
            .get("/api/articles?sort_by=topic&order=asc")
            .expect(200)
            .then((articles) => {
                const topicArray = articles.body.articles.map(
                    (article) => article.topic
                )
                expect(topicArray).toEqual(topicArray.toSorted())
            })
    })

    test("200: Responds with all articles sorted by topics desc", () => {
        return request(app)
            .get("/api/articles?sort_by=topic&order=desc")
            .expect(200)
            .then((articles) => {
                const topicArray = articles.body.articles.map(
                    (article) => article.topic
                )
                expect(topicArray).toEqual(topicArray.toSorted().reverse())
            })
    })

    test("400: Responds with a 400 if the order parameter is not allowed", () => {
        return request(app)
            .get("/api/articles?order=potato")
            .expect(400)
            .then((result) => {
                expect(result.body.msg).toBe("Bad Request: Invalid order query")
            })
    })

    test("400: Responds with a 400 if the sort_by parameter is not a valid column in the database", () => {
        return request(app)
            .get("/api/articles?sort_by=potato")
            .expect(400)
            .then((result) => {
                expect(result.body.msg).toBe(
                    "Bad Request: Invalid sort_by query"
                )
            })
    })

    test("200: Ignores an invalid query", () => {
        return request(app).get("/api/articles?a=b").expect(200)
    })
})

describe("GET /api/articles [Topic Query]", () => {
    test("200: Responds with only articles with only the topic of the query", () => {
        return request(app)
            .get("/api/articles?topic=mitch")
            .expect(200)
            .then((articles) => {
                const articleArray = articles.body.articles

                expect(articleArray.length).toBe(12)

                articleArray.forEach((article) => [
                    expect(article.topic).toBe("mitch"),
                ])
            })
    })

    test("404: Responds with 404 for a topic that doens't exist", () => {
        return request(app)
            .get("/api/articles?topic=kev")
            .expect(404)
            .then((result) => {
                expect(result.body.msg).toBe(
                    "No topic found for specified topic_name"
                )
            })
    })

    test("200: Returns an array sorted by specified column in specific order for a specific topic", () => {
        return request(app)
            .get("/api/articles?topic=mitch&sort_by=comment_count&order=asc")
            .expect(200)
            .then((articles) => {
                const articleArray = articles.body.articles

                articleArray.forEach((article) => [
                    expect(article.topic).toBe("mitch"),
                ])

                const commentCountArray = articles.body.articles.map(
                    (article) => article.comment_count
                )

                expect(commentCountArray).toEqual(
                    commentCountArray.toSorted((a, b) => a - b)
                )
            })
    })
})

describe("GET /api/articles/:article_id [comment_count]", () => {
    test("200: article has the key comment_count with the expected number of comments as its value", () => {
        return request(app)
            .get("/api/articles/1")
            .expect(200)
            .then((response) => {
                expect(response.body.article.comment_count).toBe("11")
            })
    })
    test("200: article has the key comment_count with value of 0 for an article with no comments", () => {
        return request(app)
            .get("/api/articles/2")
            .expect(200)
            .then((response) => {
                expect(response.body.article.comment_count).toBe("0")
            })
    })
})

// ADVANCED TASKS

describe("GET /api/users/:username", () => {
    test("200: returns a single user with the properties username, avatar_url & name", () => {
        return request(app)
            .get("/api/users/butter_bridge")
            .expect(200)
            .then((user) => {
                expect(user.body.user).toEqual({
                    avatar_url:
                        "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
                    name: "jonny",
                    username: "butter_bridge",
                })
            })
    })
    test("404: Responds with 404 for an id out of range", () => {
        return request(app)
            .get("/api/users/kev")
            .expect(404)
            .then((result) => {
                expect(result.body.msg).toBe(
                    "No user found for specified username"
                )
            })
    })
})

describe("PATCH /api/comments/:comment_id", () => {
    test("200: Responds with the updated comment (positive)", () => {
        return request(app)
            .patch("/api/comments/1")
            .send({ inc_votes: 1 })
            .expect(202)
            .then((comment) => {
                expect(comment.body.comment).toEqual({
                    comment_id: 1,
                    body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
                    article_id: 9,
                    author: "butter_bridge",
                    votes: 17,
                    created_at: "2020-04-06T12:17:00.000Z",
                })
            })
    })
    test("200: Responds with the updated comment (negative)", () => {
        return request(app)
            .patch("/api/comments/1")
            .send({ inc_votes: -4 })
            .expect(202)
            .then((comment) => {
                expect(comment.body.comment).toEqual({
                    comment_id: 1,
                    body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
                    article_id: 9,
                    author: "butter_bridge",
                    votes: 12,
                    created_at: "2020-04-06T12:17:00.000Z",
                })
            })
    })
    test("400: Responds with a 400 for a body with no inc_votes property", () => {
        return request(app)
            .patch("/api/comments/1")
            .send({ banana: "10" })
            .expect(400)
            .then((result) => {
                expect(result.body.msg).toBe("Bad Request: Invalid Body")
            })
    })

    test("400: Responds with a 400 for an invalid inc_votes value", () => {
        return request(app)
            .patch("/api/comments/1")
            .send({ inc_votes: "abc" })
            .expect(400)
            .then((result) => {
                expect(result.body.msg).toBe("Bad Request: Invalid Body")
            })
    })

    test("404: Responds with a 404 for an comment_id that doesn't exist", () => {
        return request(app)
            .patch("/api/comments/9999")
            .send({ inc_votes: 10 })
            .expect(404)
            .then((result) => {
                expect(result.body.msg).toBe(
                    "No comment found for specified id"
                )
            })
    })
})

describe("POST /api/articles", () => {
    test("201: Responds with the newly added article (default url)", () => {
        return request(app)
            .post("/api/articles")
            .send({
                author: "butter_bridge",
                title: "A brief history of Mitch",
                body: "From the dawn of history, we have always wondered one thing: What is the meaning of Mitch?.",
                topic: "mitch",
            })
            .expect(201)
            .then((newArticle) => {
                const articleWithoutDate = newArticle.body.article
                delete articleWithoutDate.created_at

                expect(articleWithoutDate).toEqual({
                    article_id: 14,
                    title: "A brief history of Mitch",
                    topic: "mitch",
                    author: "butter_bridge",
                    body: "From the dawn of history, we have always wondered one thing: What is the meaning of Mitch?.",
                    votes: 0,
                    article_img_url:
                        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                })
            })
    })
    test("201: Responds with the newly added article (specified url)", () => {
        return request(app)
            .post("/api/articles")
            .send({
                author: "butter_bridge",
                title: "A brief history of Mitch",
                body: "From the dawn of history, we have always wondered one thing: What is the meaning of Mitch?.",
                topic: "mitch",
                article_img_url:
                    "https://en.wikipedia.org/wiki/Monolith_%28Space_Odyssey%29#/media/File:ENS_2001_Monolith_below.jpg",
            })
            .expect(201)
            .then((newArticle) => {
                const articleWithoutDate = newArticle.body.article
                delete articleWithoutDate.created_at

                expect(articleWithoutDate).toEqual({
                    article_id: 14,
                    title: "A brief history of Mitch",
                    topic: "mitch",
                    author: "butter_bridge",
                    body: "From the dawn of history, we have always wondered one thing: What is the meaning of Mitch?.",
                    votes: 0,
                    article_img_url:
                        "https://en.wikipedia.org/wiki/Monolith_%28Space_Odyssey%29#/media/File:ENS_2001_Monolith_below.jpg",
                })
            })
    })
    test("400: returns a 400 if topic does not exist", () => {
        return request(app)
            .post("/api/articles")
            .send({
                author: "butter_bridge",
                title: "A brief history of Mitch",
                body: "From the dawn of history, we have always wondered one thing: What is the meaning of Mitch?.",
                topic: "kev",
            })
            .expect(400)
            .then((result) => {
                expect(result.body.msg).toBe(
                    "Bad Request: Topic does not exist in database"
                )
            })
    })

    test("400: returns a 400 if author does not exist", () => {
        return request(app)
            .post("/api/articles")
            .send({
                author: "kev",
                title: "A brief history of Mitch",
                body: "From the dawn of history, we have always wondered one thing: What is the meaning of Mitch?.",
                topic: "mitch",
            })
            .expect(400)
            .then((result) => {
                expect(result.body.msg).toBe(
                    "Bad Request: Author does not exist in database"
                )
            })
    })

    test("400: returns a 400 if a property is missing", () => {
        return request(app)
            .post("/api/articles")
            .send({
                title: "A brief history of Mitch",
                body: "From the dawn of history, we have always wondered one thing: What is the meaning of Mitch?.",
                topic: "mitch",
            })
            .expect(400)
            .then((result) => {
                expect(result.body.msg).toBe(
                    "Bad Request: Article missing required properties"
                )
            })
    })
    // Self imposed extention - add regex check to the url string.
})

describe("POST /api/topics", () => {
    test("201: successfully adds a topic and returns the newly created topic.", () => {
        return request(app)
            .post("/api/topics")
            .send({ slug: "Patrick", description: "A red haired coder" })
            .expect(201)
            .then((newTopic) => {
                expect(newTopic.body.topic).toEqual({
                    slug: "Patrick",
                    description: "A red haired coder",
                })
            })
    })
    test("400: returns a Bad Request error message if the slug is missing", () => {
        request(app)
            .post("/api/topics")
            .send({ slug: "Patrick" })
            .expect(400)
            .then((result) => {
                expect(result.body.msg).toBe("Property missing from body")
            })
    })
    test("400: returns a Bad Request error message if the description is missing", () => {
        request(app)
            .post("/api/topics")
            .send({ description: "A red haired coder" })
            .expect(400)
            .then((result) => {
                expect(result.body.msg).toBe("Property missing from body")
            })
    })
    test("400: Returns a Bad Request if the topic already exists", () => {
        return request(app)
            .post("/api/topics")
            .send({ slug: "mitch", description: "what a guy." })
            .then((result) => {
                expect(result.body.msg).toBe(
                    "Bad Request: A topic with that slug already exists"
                )
            })
    })
})
