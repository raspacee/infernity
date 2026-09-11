import { Router } from "express";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { DocumentController } from "../controllers/document.controller";
import { DocumentService } from "../services/document.service";
import { ConversationService } from "../services/conversation.service";
import { s3Client } from "../clients/s3-client";
import { documentsIndex } from "../clients/pinecone-client";

const router = Router();

const documentService = new DocumentService(s3Client, documentsIndex);
const conversationService = new ConversationService();

const documentController = new DocumentController(
  documentService,
  conversationService,
);

router.get(
  "/presigned-url/:conversationId",
  AuthMiddleware.validateAccessToken,
  documentController.handleGetPresignedUrl,
);

router.post(
  "/queryable/:conversationId/:documentId",
  AuthMiddleware.validateAccessToken,
  AuthMiddleware.verifyConversationOwnership,
  documentController.handleToggleDocumentQueryable,
);

router.get(
  "/documents/:conversationId",
  AuthMiddleware.validateAccessToken,
  AuthMiddleware.verifyConversationOwnership,
  documentController.handleGetDocuments,
);

export default router;
