const app = require("./app/app.js")
const port = 9090

app.listen(port, () => {
    console.log(`app.js is listening on port ${port}`)
})
