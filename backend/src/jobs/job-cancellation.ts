import { createClient } from "redis";

export async function setupJobCancellationListener(
  jobControllers: Map<string, AbortController>
) {
  const subClient = createClient({ url: process.env.REDIS_URL });

  try {
    await subClient.connect();

    subClient.subscribe("cancel-job-backend", (jobId: string) => {
      console.log("trying to cancel", jobId);
      const controller = jobControllers.get(jobId);
      if (controller) {
        controller.abort();
        jobControllers.delete(jobId);
      }
    });
  } catch (err) {
    console.error(
      "Failed to set up Redis subscription for job cancellation:",
      err
    );
  }
}
