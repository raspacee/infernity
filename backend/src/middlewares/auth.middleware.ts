import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JwtUser } from "../utils/jwt";
import { db } from "../db";
import { conversationsTable } from "../db/schema";
import { ConversationService } from "../services/conversation.service";

const conversationService = new ConversationService();

const validateAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.access_token;

  if (!token) {
    res.status(401).json({ error: "No access token provided" });
    return;
  }

  try {
    const secretKey = process.env.ACCESS_TOKEN_SECRET;

    if (!secretKey) {
      console.error("ACCESS_TOKEN_SECRET not configured");
      res.status(500).json({ error: "Server configuration error" });
      return;
    }

    const decoded = jwt.verify(token, secretKey) as JwtUser;

    // TODO: check if user exists in database

    req.user = decoded;

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({
      error: "Invalid access token",
    });
  }
};

const verifyConversationOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const { conversationId } = req.params;

    if (!conversationId) {
      res.status(400).json({ error: "Conversation Id is missing" });
      return;
    }

    const conversation = await conversationService.getConversationById(
      conversationId
    );

    if (!conversation) {
      res.status(404).json({ error: "Conversation Id is not found" });
      return;
    }

    if (conversation.userId !== req.user.id) {
      res
        .status(403)
        .json({ error: "You are not authorized to access this resource" });
      return;
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({
      error: "Error while verifying conversation ownership",
    });
  }
};

const AuthMiddleware = {
  validateAccessToken,
  verifyConversationOwnership,
};

export { AuthMiddleware };
