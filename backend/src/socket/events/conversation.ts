import { Server, Socket } from "socket.io";

const userSockets = new Map();

export default function conversationEvents(io: Server, socket: Socket) {
  socket.on("join-conversation", (conversationId: string) => {
    console.log("Joined", conversationId);
    socket.join(conversationId);
    userSockets.set(socket.id, {
      socketId: socket.id,
      conversationId,
    });
  });

  socket.on("leave-conversation", () => {
    userSockets.delete(socket.id);
  });
}
