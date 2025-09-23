import { Server, Socket } from "socket.io";
import conversationEvents from "./conversation";
import jobEvents from "./job";

export default function registerEvents(io: Server, socket: Socket) {
  conversationEvents(io, socket);
  jobEvents(socket);
}
