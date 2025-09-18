import { Emitter } from "@socket.io/redis-emitter";
import { createClient } from "redis";

let emitter: Emitter | null = null;

export async function initEmitter() {
  const redisClient = createClient({ url: process.env.REDIS_URL });

  await redisClient.connect();

  emitter = new Emitter(redisClient);

  console.log("Redis emitter connected!");
}

export function getEmitter(): Emitter {
  if (!emitter) {
    throw new Error("Emitter is not initialized. Call initEmitter first.");
  }

  return emitter;
}
