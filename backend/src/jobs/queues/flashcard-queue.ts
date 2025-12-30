import Queue from "bull";
import { redisConfig } from "../../config/redis";

export const flashCardQueue = new Queue("Flash Cards", {
  redis: redisConfig,
});

flashCardQueue.on("error", (err) => {
  console.error("Redis connection error for Flash Card queue:", err);
});

flashCardQueue.client.on("error", (err) => {
  console.error("Redis client error:", err);
});

flashCardQueue.client.on("ready", () => {
  console.log(
    "Redis client is ready — Flash cards creation queue can process jobs"
  );
});

flashCardQueue.client
  .ping()
  .then(() => console.log("Redis is connected"))
  .catch((err) => {
    console.error("Cannot connect to Redis:", err);
    process.exit(1); // stop the app
  });

flashCardQueue.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

flashCardQueue.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});

flashCardQueue.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

flashCardQueue.on("ready", () => {
  console.log("Flash Cards queue is ready");
});

flashCardQueue.on("waiting", (jobId) => {
  console.log(`Job ${jobId} is waiting`);
});
