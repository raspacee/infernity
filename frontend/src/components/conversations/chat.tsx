"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useDocumentContext } from "@/context/DocumentContext";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { NewHighlight } from "react-pdf-highlighter";
import { ChunkBoxPosition } from "@/types/message.types";
import { useRouter } from "next/navigation";

const getNextId = () => String(Math.random()).slice(2);

export default function Chat({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const { data: user } = useGetMyInfo();
  const { data, isPending } = useGetMessages(conversationId);
  const { mutateAsync: createMessage } = useCreateMessage();

  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  const {
    selectedImage,
    setSelectedImage,
    chatInputRef,
    setHighlights,
    scrollViewerTo,
  } = useDocumentContext();

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

  const addHighlight = (highlight: NewHighlight) => {
    console.log("Saving highlight", highlight);
    const id = getNextId();
    const newIHighlight = {
      ...highlight,
      id,
    };
    setHighlights([newIHighlight]);
    router.push(`#highlight-${id}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };

  const handleSendMessage = async (query: string) => {
    if (query.trim() !== "") {
      createMessage({
        conversationId,
        content: query,
        image: selectedImage,
      });
      setSelectedImage(null);
    }
  };

  const handleStopStreaming = () => {
    socket?.emit("cancel-job", currentJobId);
  };

  const components = {
    li: ({ children, ...props }: { children?: React.ReactNode }) => {
      const text = children?.toString() || "";
      const isQuestion = text.trim().endsWith("?");

      if (isQuestion)
        return (
          <li
            onClick={() => {
              if (chatInputRef.current) chatInputRef.current.value = text;
            }}
            className="hover:border-primary hover:bg-primary/10 cursor-pointer rounded border-l-4 border-transparent p-2 transition-colors duration-200"
          >
            {children}
          </li>
        );

      return <li {...props}>{children}</li>;
    },
    used_chunks: ({ ...props }) => {
      return null;
    },
  };

  const calculateBoundingRect = (
    rects: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      width: number;
      height: number;
    }[],
  ) => {
    const x1 = Math.min(...rects.map((r) => r.x1));
    const y1 = Math.min(...rects.map((r) => r.y1));
    const x2 = Math.max(...rects.map((r) => r.x2));
    const y2 = Math.max(...rects.map((r) => r.y2));

    return {
      x1,
      y1,
      x2,
      y2,
      width: x2 - x1,
      height: y2 - y1,
    };
  };

  const isFiniteRect = (r: ChunkBoxPosition) =>
    [r.x1, r.y1, r.x2, r.y2, r.width, r.height].every(
      (v) => Number.isFinite(v) && v !== 0,
    );

  const showHighlight = (boxPositions: ChunkBoxPosition[]) => {
    const rects = boxPositions
      .filter((b) => isFiniteRect(b))
      .map((b) => ({
        x1: b.x1,
        y1: b.y1,
        x2: b.x2,
        y2: b.y2,
        width: b.width,
        height: b.height,
      }));

    const boundingRect = calculateBoundingRect(rects);

    const newHighlight: NewHighlight = {
      content: {
        text: "",
      },
      comment: {
        emoji: "",
        text: "",
      },
      position: {
        rects,
        pageNumber: boxPositions[0].pageNo,
        boundingRect,
        usePdfCoordinates: true,
      },
    };
    addHighlight(newHighlight);
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {data &&
          data.messages.length > 0 &&
          data.messages.map((message, idx) => (
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
              <div className="flex flex-col gap-2 p-3">
                <div
                  className={cn("text-base font-normal", {
                    "bg-elevation-level1 rounded-lg": message.role === "user",
                    "": message.role === "assistant",
                  })}
                >
                  {message.queryImageURL && (
                    <img
                      src={message.queryImageURL}
                      className="aspect-[2/1] w-60 object-contain"
                    />
                  )}
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={idx === 0 ? components : {}}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
                <div className="flex gap-1">
                  {message.annotations.map((annotation) => (
                    <Button
                      size="28"
                      variant="soft"
                      color="neutral"
                      key={annotation.chunkId}
                      onClick={() => showHighlight(annotation.annotations)}
                    >
                      {annotation.chunkId.slice(0, 2)}
                    </Button>
                  ))}
                </div>
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
