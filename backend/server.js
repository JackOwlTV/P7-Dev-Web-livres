const http = require("http");
const app = require("./app");

const server = http.createServer(app);
server.on("listening", () => {
    console.log(`listening on PORT ${process.env.PORT || 4000}`);
});
server.listen(process.env.PORT || 4000);