# Northcoders News API

Hosted on: https://pjce-nc-news.onrender.com/api

# Summary

This project is a backend for a simple news website. It has APIs that allow for retrieval of information about users,
topics, articles and comments. It has also has APIs that all for articles to be voted on, comments to be deleted, and
comments to be posted. More features will be implemented.

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/).

# Setup

-   Clone the repository: `git clone https://github.com/patrick-jc-evans/PJCE-NC-News`
-   Install required packages: `npm install`

-   To create the database locally, use the command: `npm run setup-dbs`
-   To seed the database, use the command: `npm run seed`
-   To run test, use the command: `npm test`

## Environments

To run the code in this repo, two environments need to be created

.env.test
which references the database "nc_news_test"

.env.development
which references the database "nc_news"

## Minimum Version

Node.js 23.1.0

Postgres: 16.6
