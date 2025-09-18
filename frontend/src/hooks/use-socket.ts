import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function useSocket() {
  useEffect(() => {
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_API_URL);
    }

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, []);

  return socket;
}
