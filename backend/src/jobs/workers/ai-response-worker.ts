import {
  HumanMessage,
  HumanMessageFields,
  MessageContent,
  MessageContentComplex,
} from "@langchain/core/messages";
import { DocumentService } from "../../services/document.service";
import { llm, systemPrompt } from "../../utils/chat";
import { aiResponseQueue } from "../queues/ai-response-queue";
import { s3Client } from "../../clients/s3-client";
import { documentsIndex } from "../../clients/pinecone-client";
import { getEmitter } from "../emitter";
import { AI_STATUS, AI_STATUS_QUEUE_NAME } from "../../types/ai-status.types";
import { db } from "../../db";
import {
  chunkBoxPositionToMessageMappingTable,
  messagesTable,
} from "../../db/schema";
import { setupJobCancellationListener } from "../job-cancellation";
import { GetObjectCommand } from "@aws-sdk/client-s3";

const jobControllers = new Map<string, AbortController>();
setupJobCancellationListener(jobControllers);

const documentService = new DocumentService(s3Client, documentsIndex);

export type AiResponseQueueType = {
  messageId: number;
  userId: string;
  conversationId: string;
  query: string;
  queryImageKey: string | null;
  messagesHistory: (typeof messagesTable.$inferSelect)[];
};

aiResponseQueue.process(2, async (job) => {
  const { userId, conversationId, query, queryImageKey, messagesHistory } =
    job.data as AiResponseQueueType;

  const io = getEmitter();

  const responseChunks: MessageContent[] = [];

  const controller = new AbortController();
  jobControllers.set(job.id.toString(), controller);

  try {
    const t0 = process.hrtime.bigint();

    const queryableDocuments =
      await documentService.getQueryableDocuments(conversationId);

    const context = await documentService.getNearestChunks(
      userId,
      query,
      queryableDocuments.map((d) => d.id),
    );

    console.log("Context", context);

    const t1 = process.hrtime.bigint();
    const contextMs = Number(t1 - t0) / 1_000_000; // convert ns → ms
    console.log(`getNearestChunks took ${contextMs.toFixed(2)} ms`);

    const llmFields: HumanMessageFields = {
      content: [
        {
          type: "text",
          text:
            `You are answering based on the following numbered context chunks:\n\n${context
              .map((c, i) => `[${i}] ${c.chunkText}`)
              .join("\n\n")}\n\n` +
            `When you answer, include at the end of your response a JSON object indicating which chunk numbers were most influential, in the form example: <used_chunks>{"used_chunk_idx": [0, 2, 5]}</used_chunks>.`,
        },
        {
          type: "text",
          text: `\n\nQuestion: ${query}`,
        },
        {
          type: "text",
          text: `\n\nPrevious conversation history: ${JSON.stringify(
            messagesHistory,
            null,
            2,
          )}`,
        },
      ],
    };

    if (queryImageKey) {
      const command = new GetObjectCommand({
        Bucket: process.env.MINIO_BUCKET_NAME,
        Key: queryImageKey,
      });

      const { Body } = await s3Client.send(command);
      if (Body) {
        const buffer = Buffer.from(await Body.transformToByteArray());
        const base64Image = buffer.toString("base64");

        (llmFields.content as MessageContentComplex[]).push({
          type: "image_url",
          image_url: { url: `data:image/png;base64,${base64Image}` },
        });
      }
    }

    const response = await llm.stream(
      [systemPrompt, new HumanMessage(llmFields)],
      { signal: controller.signal },
    );

    for await (const chunk of response) {
      responseChunks.push(chunk.content);
      io.to(conversationId).emit(AI_STATUS_QUEUE_NAME, {
        jobId: job.id,
        status: "streaming" as AI_STATUS,
        data: chunk.content,
      });
    }

    const usedChunkIdxsMatch = responseChunks
      .join("")
      .match(/<used_chunks>(.*?)<\/used_chunks>/);

    const [createdMessage] = await db
      .insert(messagesTable)
      .values({
        role: "assistant",
        content: responseChunks.join(""),
        conversationId,
        createdAt: new Date().toISOString(),
      })
      .returning();

    if (usedChunkIdxsMatch) {
      const usedChunkIdxs = JSON.parse(usedChunkIdxsMatch[1]) as {
        used_chunk_idx: number[];
      };
      let toBeInserted: { chunkBoxPositionId: string; messageId: number }[] =
        [];
      for (const idx of usedChunkIdxs.used_chunk_idx) {
        console.log(idx, context[idx]);
        toBeInserted.push(
          ...context[idx].boxPositions.map((boxPosition) => ({
            chunkBoxPositionId: boxPosition.id,
            messageId: createdMessage.id,
          })),
        );
      }
      if (toBeInserted.length > 0) {
        await db
          .insert(chunkBoxPositionToMessageMappingTable)
          .values(toBeInserted);
      }
    }

    io.to(conversationId).emit(AI_STATUS_QUEUE_NAME, {
      jobId: job.id,
      status: "finished" as AI_STATUS,
    });
  } catch (err) {
    if (controller.signal.aborted) {
      io.to(conversationId).emit(AI_STATUS_QUEUE_NAME, {
        status: "cancelled" as AI_STATUS,
      });

      await db.insert(messagesTable).values({
        role: "assistant",
        content: responseChunks.join(""),
        conversationId,
        createdAt: new Date().toISOString(),
      });

      return;
    } else {
      console.error(err);
      io.to(conversationId).emit(AI_STATUS_QUEUE_NAME, {
        jobId: job.id,
        status: "error" as AI_STATUS,
      });
      throw err;
    }
  } finally {
    jobControllers.delete(job.id.toString());
  }
});
