import { Server, Socket } from "socket.io";
import conversationEvents from "./conversation";

export default function registerEvents(io: Server, socket: Socket) {
  conversationEvents(io, socket);
}
