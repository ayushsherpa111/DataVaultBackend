const dotEnv = require("dotenv");
dotEnv.config();
const http = require("http");
const app = require("../app");
const server = http.createServer(app);
const port = normalizePort(process.env.PORT);
const debug = require("debug")("dataVault:server");
app.set("port", port);

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}

function normalizePort(port) {
  let p = parseInt(port, 10);
  if (isNaN(p)) {
    return port;
  }

  if (p > 0) {
    return port;
  }
  return 8000;
}

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}
