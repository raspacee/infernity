import { Request, Response } from "express";
import { DocumentService } from "../services/document.service";
import { s3Client } from "../clients/s3-client";
import { documentsIndex } from "../clients/pinecone-client";
import { flashCardQueue } from "../jobs/queues/flashcard-queue";
import { FlashCardsCreationQueueType } from "../jobs/workers/flashcards-worker";
import { getIO } from "../socket";
import {
  FLASHCARDS_STATUS,
  FLASHCARDS_STATUS_QUEUE_NAME,
} from "../types/flashcards-status.types";
import { FlashCardsService } from "../services/flashcards.service";

const documentService = new DocumentService(s3Client, documentsIndex);

const handleCreateFlashCards = async (req: Request, res: Response) => {
  const io = getIO();
  const { conversationId } = req.params;

  try {
    const document = await documentService.getDocumentByConversationId(
      conversationId
    );

    if (!document) {
      return res.status(404).json({ error: "Conversation Id not found" });
    }

    io.to(conversationId).emit(FLASHCARDS_STATUS_QUEUE_NAME, {
      status: "creating" as FLASHCARDS_STATUS,
    });

    await flashCardQueue.add(
      {
        conversationId,
        documentText: document.textContent,
      } as FlashCardsCreationQueueType,
      {
        attempts: 3,
        backoff: { type: "exponential" },
        delay: 1000,
      }
    );

    return res.status(200).json({ message: "Flash cards creation started" });
  } catch (err) {
    console.error(err);
    io.to(conversationId).emit(FLASHCARDS_STATUS_QUEUE_NAME, {
      status: "error" as FLASHCARDS_STATUS,
    });
    return res.status(500).json({ error: "Error while creating flash cards" });
  }
};

const handleGetFlashCards = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const flashCards = await FlashCardsService.getFlashCardsByConversationId(
      conversationId
    );

    return res.status(200).json({ data: flashCards });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error while getting flash cards" });
  }
};

const FlashCardController = {
  handleCreateFlashCards,
  handleGetFlashCards,
};

export { FlashCardController };
