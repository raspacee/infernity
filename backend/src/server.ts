import { app } from "./app";
import http from "http";
import { initSocket } from "./socket";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";

const port = app.get("port") || 8000;

const server = http.createServer(app);

export const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

const io = initSocket(server);

Promise.all([pubClient.connect(), subClient.connect()])
  .then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    console.log("Socket.IO Redis adapter connected.");
  })
  .catch(console.error);

server.listen(port, () => {
  console.log("Server listening on port", port);
});

export default server;
