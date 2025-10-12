import "dotenv/config";

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import DocumentRouter from "./routes/document.router";
import LLMRouter from "./routes/llm.router";
import AuthRouter from "./routes/auth.router";
import UserRouter from "./routes/user.router";
import ConversationRouter from "./routes/conversation.router";

const app = express();

app.use(
  express.json({
    limit: "50mb",
  })
);
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL!,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  })
);

app.set("port", process.env.PORT || 8000);

app.use("/api/documents", DocumentRouter);
app.use("/api/llm", LLMRouter);
app.use("/api/auth", AuthRouter);
app.use("/api/users", UserRouter);
app.use("/api/conversations", ConversationRouter);

export { app };
