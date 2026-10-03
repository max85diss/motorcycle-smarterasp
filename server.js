

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const port = process.env.PORT || 3000;
const hostname = "127.0.0.1";

const app = next({
    dev: false,
    hostname,
    port,
});

const handle = app.getRequestHandler();

app.prepare().then(() => {

    createServer(async (req, res) => {

        try {

            const parsedUrl = parse(req.url, true);

            await handle(req, res, parsedUrl);

        } catch (err) {

            console.error("Request error:", err);

            res.statusCode = 500;
            res.end("Internal Server Error");
        }

    }).listen(port, hostname, () => {

        console.log(
            `Next.js running at http://${hostname}:${port}`
        );

    });

});

