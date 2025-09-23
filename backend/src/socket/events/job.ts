import { Socket } from "socket.io";
import { pubClient } from "../../server";

export default function jobEvents(socket: Socket) {
  socket.on("cancel-job", async (jobId: string) => {
    await pubClient.publish("cancel-job-backend", jobId);
  });
}
