import { Request, Response } from "express";
import { DocumentService } from "../services/document.service";
import { ConversationService } from "../services/conversation.service";

export class DocumentController {
  constructor(
    private documentService: DocumentService,
    private conversationService: ConversationService,
  ) {
    this.documentService = documentService;
    this.conversationService = conversationService;
  }

  handleGetPresignedUrl = async (req: Request, res: Response) => {
    try {
      const conversationId = req.params.conversationId;
      if (!conversationId) {
        res.status(400).json({ error: "Conversation id is missing" });
        return;
      }

      const conversation =
        await this.conversationService.getConversationWithDocument(
          conversationId,
        );
      if (!conversation) {
        res
          .status(404)
          .json({ error: "Cannot find conversation with that id" });
        return;
      }

      const document = conversation.documents;

      if (document.userId !== req.user!.id) {
        res
          .status(401)
          .json({ error: "You don't have permission to access this document" });
        return;
      }

      const presignedUrl = await this.documentService.getPresignedUrl(
        document.s3Key,
        document.bucketName,
      );

      res.status(200).json({
        presignedUrl,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to get presigned url" });
    }
  };

  public handleToggleDocumentQueryable = async (
    req: Request,
    res: Response,
  ) => {
    try {
      const conversationId = req.params.conversationId;
      const documentId = req.params.documentId;

      if (!conversationId || !documentId) {
        res
          .status(400)
          .json({ error: "Conversation id or document id is missing" });
        return;
      }

      await this.documentService.toggleDocumentQueryable(documentId);

      res.status(200).json({
        message: "Document queryable toggled successfully",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to toggle document queryable" });
    }
  };

  // handleUploadDocument = async (req: Request, res: Response) => {
  //   try {
  //     if (!req.file) {
  //       res.status(400).json({ error: "No file uploaded" });
  //       return;
  //     }

  //     const result = await this.documentService.uploadDocument({
  //       file: req.file,
  //       userId: req.user!.id,
  //     });

  //     res.status(201).json({
  //       documentId: result.documentId,
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).json({ error: "Failed to upload document" });
  //   }
  // };
}
