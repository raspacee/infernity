import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { DocumentService } from "../services/document.service";
import { ConversationService } from "../services/conversation.service";
import { MessageService } from "../services/message.service";
import { aiResponseQueue } from "../jobs/queues/ai-response-queue";
import { getIO } from "../socket";
import { AI_STATUS, AI_STATUS_QUEUE_NAME } from "../types/ai-status.types";
import { putObject, s3Client } from "../clients/s3-client";
import { AiResponseQueueType } from "../jobs/workers/ai-response-worker";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { updateConversationSchema } from "../validators/conversation.validator";
import { llm, NAMING_LLM_SYSTEM_PROMPT, namingLlm } from "../utils/chat";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { NotFoundError } from "../exceptions/not-found-error";

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
        title: "Untitled Conversation",
        userId: req.user!.id,
        createdAt: new Date().toISOString(),
      });

      const result = await this.documentService.uploadDocument({
        file: req.file,
        conversationId: conversation.id,
        userId: req.user!.id,
      });

      const pdf = result.parsedPdf;
      let textForSummary = "";
      // If document is less than 15 pages, feed whole document for summary
      if (pdf.totalPages <= 15) {
        textForSummary = pdf.fullContent;
      } else {
        // Else, Feed first 10 and last 5 pages for summary
        for (let i = 0; i < 10; i++) {
          textForSummary += pdf.pages[i].pageContent;
        }
        for (let i = pdf.totalPages - 5; i < pdf.totalPages; i++) {
          textForSummary += pdf.pages[i].pageContent;
        }
      }

      const summary = await llm.invoke([
        new SystemMessage(`You are a document analysis assistant.
      Your task is to generate a concise, factual summary of a document based on the provided text excerpts.
      Summarize key ideas, objectives, and conclusions while removing filler, repetition, or citations.
      If the document seems incomplete, infer structure cautiously and note possible missing sections (e.g., “conclusion not included”).
      Do not invent facts.
      Do not reference “the user” or “this document” directly; instead, write in a neutral, academic tone.
      Target summary length: 200–300 words unless otherwise specified.

      After the summary, provide an ordered list of 5 insightful questions the user might consider asking about the document’s content, implications, or next steps.
      These questions should promote deeper understanding or critical thinking, not surface-level details. Give the title inside <title> tags.
      For example: <title>How transformers work in LLM</title>
      `),
        new HumanMessage(textForSummary),
      ]);
      const title = (summary.content as string).match(/<title>(.*?)<\/title>/i);
      const tasks: Object[] = [
        await messageService.createMessage({
          content: (summary.content as string).replace(
            /<title>(.*?)<\/title>/i,
            "",
          ),
          conversationId: conversation.id,
          createdAt: new Date().toISOString(),
          role: "assistant",
        }),
      ];
      if (title && title[1].length > 0) {
        tasks.push(
          await conversationService.updateConversation(conversation.id, {
            title: title[1],
          }),
        );
      }

      await Promise.all(tasks);

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

  public handleAddDocument = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const { conversationId } = req.params;

      await this.documentService.uploadDocument({
        file: req.file,
        conversationId: conversationId,
        userId: req.user!.id,
      });

      return res.status(201).json({ message: "Document added successfully" });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ error: "Conversation Id not found" });
      }

      console.error(err);
      res.status(500).json({
        error: "Failed to add document to conversation",
      });
    }
  };

  public handleGetUserConversations = async (req: Request, res: Response) => {
    try {
      const conversations = await conversationService.getUserConversations(
        req.user!.id,
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

      const result =
        await conversationService.getConversationWithDocument(conversationId);

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
                err,
              );
              return { ...msg, imageUrl: null };
            }
          }
          return msg;
        }),
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

      const [message, messagesHistory] = await Promise.all([
        await messageService.createMessage({
          content,
          conversationId,
          role: "user",
          createdAt: new Date().toISOString(),
          queryImageKey,
        }),
        await messageService.getLastMessages(conversationId),
      ]);

      if (messagesHistory.length === 0) {
        const title = await namingLlm.invoke([
          new SystemMessage(NAMING_LLM_SYSTEM_PROMPT),
          new HumanMessage(
            "You are a model used to exclusively give title to a conversation session. You will be a user query based on that give the title.",
          ),
        ]);
        conversationService
          .updateConversation(conversationId, {
            title: title.content as string,
          })
          .catch((err) =>
            console.error("Failed to update conversation title: ", err),
          );
      }

      const job = await aiResponseQueue.add(
        {
          messageId: message.id,
          userId: req.user!.id,
          conversationId,
          query: content,
          queryImageKey,
          messagesHistory,
        } as AiResponseQueueType,
        {
          attempts: 3,
          backoff: { type: "exponential" },
          delay: 1000,
        },
      );

      res.status(201).json({ message, jobId: job.id });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Failed to create conversation message",
      });
    }
  };

  public handleUpdateConversation = async (req: Request, res: Response) => {
    try {
      const { conversationId } = req.params;

      const parsed = updateConversationSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(400)
          .json({ error: "Invalid payload", details: parsed.error.flatten() });
        return;
      }

      const updates = parsed.data;

      const conversation = await conversationService.updateConversation(
        conversationId,
        updates,
      );
      res.status(200).json(conversation);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Failed to update conversation message",
      });
    }
  };

  public handleGetSources = async (req: Request, res: Response) => {
    try {
      const { conversationId } = req.params;

      const sources =
        await conversationService.getConversationSources(conversationId);

      res.status(200).json({ data: sources });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ error: "Conversation Id not found" });
      }

      console.error(err);
      res.status(500).json({
        error: "Failed to get conversation sources",
      });
    }
  };

  public handleDeleteConversation = async (req: Request, res: Response) => {
    try {
      const { conversationId } = req.params;

      await conversationService.deleteConversation(conversationId);

      res.status(200).json({ message: "Conversation deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Failed to delete conversation",
      });
    }
  };
}
