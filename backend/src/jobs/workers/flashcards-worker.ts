import { createAgent, providerStrategy } from "langchain";
import { z } from "zod/v4";
import { getEmitter } from "../emitter";
import { flashCardQueue } from "../queues/flashcard-queue";
import { FlashCardsService } from "../../services/flashcards.service";
import {
  FLASHCARDS_STATUS,
  FLASHCARDS_STATUS_QUEUE_NAME,
} from "../../types/flashcards-status.types";

const FlashCard = z.object({
  frontContent: z
    .string()
    .describe("The front content of the flash card. Usually a question."),
  backContent: z
    .string()
    .describe("The hidden back content of the flash card."),
});

const FlashCards = z.object({
  flashcards: z.array(FlashCard),
});

export type FlashCardsType = z.infer<typeof FlashCards>;

const agent = createAgent({
  model: "gpt-4o-mini",
  tools: [],
  responseFormat: providerStrategy(FlashCards),
});

export type FlashCardsCreationQueueType = {
  conversationId: string;
  documentText: string;
};

flashCardQueue.process(
  2,
  async (job: { data: FlashCardsCreationQueueType }) => {
    const { documentText, conversationId } = job.data;

    const io = getEmitter();

    try {
      const result = await agent.invoke({
        messages: [
          {
            role: "system",
            content:
              "You are an AI that is tasked with creating flashcards from a document. You need to create flashcards with frontContent and backContent. The flash cards should be interesting and only include things from the document.",
          },
          {
            role: "human",
            content: `The documents whole text is given here: ${documentText}`,
          },
          {
            role: "human",
            content: "Create ten flashcards from the document provided",
          },
        ],
      });

      const flashCards = result.structuredResponse;

      await FlashCardsService.createFlashCards(
        flashCards,
        "Test FlashCards",
        conversationId
      );

      io.to(conversationId).emit(FLASHCARDS_STATUS_QUEUE_NAME, {
        status: "finished" as FLASHCARDS_STATUS,
      });
    } catch (err) {
      console.error("Error while creating flash cards", err);
      io.to(conversationId).emit(FLASHCARDS_STATUS_QUEUE_NAME, {
        status: "error" as FLASHCARDS_STATUS,
      });
    }
  }
);
