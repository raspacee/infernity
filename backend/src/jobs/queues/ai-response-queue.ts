import Queue from "bull";
import { redisConfig } from "../../config/redis";

export const aiResponseQueue = new Queue("AI Responses", {
  redis: redisConfig,
});

aiResponseQueue.on("error", (err) => {
  console.error("Redis connection error for AI Response queue:", err);
});

aiResponseQueue.client.on("error", (err) => {
  console.error("Redis client error:", err);
});

aiResponseQueue.client.on("ready", () => {
  console.log("✅ Redis client is ready — AI Response queue can process jobs");
});

aiResponseQueue.client
  .ping()
  .then(() => console.log("✅ Redis is connected"))
  .catch((err) => {
    console.error("❌ Cannot connect to Redis:", err);
    process.exit(1); // stop the app
  });

aiResponseQueue.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

aiResponseQueue.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});

aiResponseQueue.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

aiResponseQueue.on("ready", () => {
  console.log("AI Response queue is ready");
});

aiResponseQueue.on("waiting", (jobId) => {
  console.log(`Job ${jobId} is waiting`);
});
