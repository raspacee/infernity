"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useGetMessages } from "@/hooks/message/use-get-messages";
import { useCreateMessage } from "@/hooks/message/use-create-message";
import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "@/hooks/use-socket";
import { AI_STATUS } from "@/types/ai-status.types";
import { useQueryClient } from "@tanstack/react-query";
import { useGetMyInfo } from "@/hooks/user/use-get-user-info";
import { getNameInitials } from "@/lib/helpers";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ChatInput from "./chat-input";

export default function Chat({ conversationId }: { conversationId: string }) {
  const { data: user } = useGetMyInfo();
  const { data, isPending } = useGetMessages(conversationId);
  const { mutateAsync: createMessage } = useCreateMessage();

  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  /* The status of AI is deliberately represented by two variables instead
   * of one union type variable to combat the glitch of message dissapearing
   * when ai streaming is finished
   */
  const [aiThinking, setAiThinking] = useState(false);
  const [aiStream, setAiStream] = useState("");

  const aiStreaming = aiStream !== "";

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const socket = useSocket();

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    socket.emit("join-conversation", conversationId);

    socket.on(
      "ai-status",
      ({
        status,
        data,
        jobId,
      }: {
        status: AI_STATUS;
        data?: string;
        jobId?: string;
      }) => {
        switch (status) {
          case "thinking":
            setAiThinking(true);
            break;

          case "finished":
          case "cancelled":
            setAiThinking(false);
            queryClient
              .refetchQueries({
                queryKey: ["conversations", conversationId, "messages"],
              })
              .then(() => setAiStream(""));
            break;

          case "streaming":
            setAiThinking(false);
            if (jobId) setCurrentJobId(jobId);
            if (data) setAiStream((prev) => prev + data);
            break;
        }
      },
    );

    return () => {
      socket.emit("leave-conversation", conversationId);
    };
  }, [socket, conversationId, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [aiStream, data]);

  const handleSendMessage = async (query: string) => {
    createMessage({ conversationId, content: query });
  };

  const handleStopStreaming = () => {
    socket?.emit("cancel-job", currentJobId);
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {data &&
          data.messages.length > 0 &&
          data.messages.map((message) => (
            <div key={message.id} className="flex gap-3">
              <Avatar className="mt-3">
                <AvatarImage
                  className="border-border border object-contain"
                  src={message.role === "assistant" ? "/logo.svg" : undefined}
                  alt="User profile picture"
                />
                <AvatarFallback>
                  {getNameInitials(user?.name || "")}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn("p-3 text-base font-normal", {
                  "bg-elevation-level1 rounded-lg": message.role === "user",
                  "": message.role === "assistant",
                })}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        {data?.messages.length === 0 && <p>No messages</p>}

        {aiThinking && (
          <p className="text-fg-tertiary text-sm font-medium">
            AI is thinking...
          </p>
        )}

        {aiStream && (
          <div className="flex gap-3">
            <Avatar className="mt-3">
              <AvatarImage src="/logo.svg" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div className="bg-bg-level0 rounded-lg p-3 text-base font-normal">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {aiStream}
              </ReactMarkdown>
            </div>
          </div>
        )}

        <div
          data-slot="scroll-into-view"
          className="h-px w-full"
          ref={messagesEndRef}
        />
      </div>
      <div className="h-fit w-full p-3">
        <ChatInput
          aiThinking={aiThinking}
          aiStreaming={aiStreaming}
          handleSendMessage={handleSendMessage}
          handleStopStreaming={handleStopStreaming}
        />
      </div>
    </div>
  );
}
