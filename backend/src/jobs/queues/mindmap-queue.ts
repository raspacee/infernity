import Queue from "bull";
import { redisConfig } from "../../config/redis";

export const mindMapQueue = new Queue("Mind Map Queue", {
  redis: redisConfig,
});

mindMapQueue.on("error", (err) => {
  console.error("Redis connection error for Mind Map queue:", err);
});

mindMapQueue.client.on("error", (err) => {
  console.error("Redis client error:", err);
});

mindMapQueue.client.on("ready", () => {
  console.log(
    "Redis client is ready — Mind Map creation queue can process jobs"
  );
});

mindMapQueue.client
  .ping()
  .then(() => console.log("Redis is connected"))
  .catch((err) => {
    console.error("Cannot connect to Redis:", err);
    process.exit(1); // stop the app
  });

mindMapQueue.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

mindMapQueue.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});

mindMapQueue.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

mindMapQueue.on("ready", () => {
  console.log("Mind Map queue is ready");
});

mindMapQueue.on("waiting", (jobId) => {
  console.log(`Job ${jobId} is waiting`);
});
