import { Request, Response } from "express";
import { DocumentService } from "../services/document.service";
import { s3Client } from "../clients/s3-client";
import { documentsIndex } from "../clients/pinecone-client";
import { getIO } from "../socket";
import {
  FLASHCARDS_STATUS,
  FLASHCARDS_STATUS_QUEUE_NAME,
} from "../types/flashcards-status.types";
import {
  MIND_MAP_STATUS,
  MIND_MAP_STATUS_QUEUE_NAME,
} from "../types/mindmap-status.types";
import { mindMapQueue } from "../jobs/queues/mindmap-queue";
import { MindMapCreationQueueType } from "../jobs/workers/mindmap-worker";
import { MindMapService } from "../services/mindmap.service";

const documentService = new DocumentService(s3Client, documentsIndex);

const handleCreateMindMap = async (req: Request, res: Response) => {
  const io = getIO();
  const { conversationId } = req.params;

  try {
    const document = await documentService.getDocumentByConversationId(
      conversationId
    );

    if (!document) {
      return res.status(404).json({ error: "Conversation Id not found" });
    }

    io.to(conversationId).emit(MIND_MAP_STATUS_QUEUE_NAME, {
      status: "creating" as MIND_MAP_STATUS,
    });

    await mindMapQueue.add(
      {
        conversationId,
        documentText: document.textContent,
      } as MindMapCreationQueueType,
      {
        attempts: 3,
        backoff: { type: "exponential" },
        delay: 1000,
      }
    );

    return res.status(200).json({ message: "Mind Map creation started" });
  } catch (err) {
    console.error(err);
    io.to(conversationId).emit(MIND_MAP_STATUS_QUEUE_NAME, {
      status: "error" as MIND_MAP_STATUS,
    });
    return res.status(500).json({ error: "Error while creating mind map" });
  }
};

const handleGetMindMap = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const mindMap = await MindMapService.getMindMapByConversationId(
      conversationId
    );

    return res.status(200).json({ data: mindMap });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error while getting mind map" });
  }
};

const MindMapController = {
  handleCreateMindMap,
  handleGetMindMap,
};

export { MindMapController };
