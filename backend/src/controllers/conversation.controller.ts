import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { DocumentService } from "../services/document.service";
import { db } from "../db";
import { conversationsTable } from "../db/schema";
import { ConversationService } from "../services/conversation.service";
import { MessageService } from "../services/message.service";
import { aiResponseQueue } from "../jobs/queues/ai-response-queue";
import { getIO } from "../socket";
import { AI_STATUS, AI_STATUS_QUEUE_NAME } from "../types/ai-status.types";
import { putObject, s3Client } from "../clients/s3-client";
import { AiResponseQueueType } from "../jobs/workers/ai-response-worker";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const conversationService = new ConversationService();
const messageService = new MessageService();

export class ConversationController {
  constructor(private documentService: DocumentService) {
    this.documentService = documentService;
  }

  public handleCreateConversation = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const conversation = await conversationService.createConversation({
        id: uuid(),
        title: "New Conversation",
        userId: req.user!.id,
        createdAt: new Date().toISOString(),
      });

      const result = await this.documentService.uploadDocument({
        file: req.file,
        conversationId: conversation.id,
        userId: req.user!.id,
      });

      res.status(201).json({
        documentId: result.documentId,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Failed to create new conversation",
      });
    }
  };

  public handleGetUserConversations = async (req: Request, res: Response) => {
    try {
      const conversations = await conversationService.getUserConversations(
        req.user!.id
      );
      res.json({ conversations });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Failed to get user conversations",
      });
    }
  };

  public handleGetConversation = async (req: Request, res: Response) => {
    try {
      const { conversationId } = req.params;

      const result = await conversationService.getConversationWithDocument(
        conversationId
      );

      res.status(200).json({
        conversation: result?.conversations,
        document: result?.documents,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Failed to get conversation",
      });
    }
  };

  public handleGetMessages = async (req: Request, res: Response) => {
    try {
      const { conversationId } = req.params;

      const messages = await messageService.getMessages(conversationId);

      const messagesWithURLs = await Promise.all(
        messages.map(async (msg) => {
          if (msg.queryImageKey) {
            try {
              const command = new GetObjectCommand({
                Bucket: process.env.MINIO_BUCKET_NAME,
                Key: msg.queryImageKey,
              });

              const url = await getSignedUrl(s3Client, command, {
                expiresIn: 60 * 60,
              });

              return {
                ...msg,
                queryImageURL: url,
              };
            } catch (err) {
              console.error(
                `Failed to generate signed URL for key ${msg.queryImageKey}`,
                err
              );
              return { ...msg, imageUrl: null };
            }
          }
          return msg;
        })
      );

      res.status(200).json({ messages: messagesWithURLs });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Failed to get conversation messages",
      });
    }
  };

  public handleCreateMessage = async (req: Request, res: Response) => {
    try {
      let queryImageKey: string | null = null;

      if (req.file) {
        queryImageKey = await putObject(req.file);
      }

      const { content } = req.body;
      const { conversationId } = req.params;

      const io = getIO();

      io.to(conversationId).emit(AI_STATUS_QUEUE_NAME, {
        status: "thinking" as AI_STATUS,
      });

      const message = await messageService.createMessage({
        content,
        conversationId,
        role: "user",
        createdAt: new Date().toISOString(),
        queryImageKey,
      });

      const job = await aiResponseQueue.add(
        {
          messageId: message.id,
          userId: req.user!.id,
          conversationId,
          query: content,
          queryImageKey,
        } as AiResponseQueueType,
        {
          attempts: 3,
          backoff: { type: "exponential" },
          delay: 1000,
        }
      );

      res.status(201).json({ message, jobId: job.id });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Failed to create conversation message",
      });
    }
  };
}
