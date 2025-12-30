import { Router } from "express";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { upload } from "../utils/multer";
import { ConversationController } from "../controllers/conversation.controller";
import { DocumentService } from "../services/document.service";
import { s3Client } from "../clients/s3-client";
import { documentsIndex } from "../clients/pinecone-client";
import { FlashCardController } from "../controllers/flashcard.controller";

const router = Router();

const documentService = new DocumentService(s3Client, documentsIndex);

const conversationController = new ConversationController(documentService);

router.post(
  "/",
  AuthMiddleware.validateAccessToken,
  upload.single("document"),
  conversationController.handleCreateConversation
);

router.get(
  "/",
  AuthMiddleware.validateAccessToken,
  conversationController.handleGetUserConversations
);

router.get(
  "/:conversationId",
  AuthMiddleware.validateAccessToken,
  AuthMiddleware.verifyConversationOwnership,
  conversationController.handleGetConversation
);

router.patch(
  "/:conversationId",
  AuthMiddleware.validateAccessToken,
  AuthMiddleware.verifyConversationOwnership,
  conversationController.handleUpdateConversation
);

router.get(
  "/:conversationId/messages",
  AuthMiddleware.validateAccessToken,
  AuthMiddleware.verifyConversationOwnership,
  conversationController.handleGetMessages
);

router.post(
  "/:conversationId/messages",
  AuthMiddleware.validateAccessToken,
  AuthMiddleware.verifyConversationOwnership,
  upload.single("image"),
  conversationController.handleCreateMessage
);

router.post(
  "/:conversationId/flashcards",
  AuthMiddleware.validateAccessToken,
  AuthMiddleware.verifyConversationOwnership,
  FlashCardController.handleCreateFlashCards
);

router.get(
  "/:conversationId/flashcards",
  AuthMiddleware.validateAccessToken,
  AuthMiddleware.verifyConversationOwnership,
  FlashCardController.handleGetFlashCards
);

export default router;
