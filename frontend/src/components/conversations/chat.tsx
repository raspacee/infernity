"use client";

import { TextArea } from "../ui/text-area";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { IconButton } from "../ui/button";
import { ArrowUp } from "lucide-react";
import { useGetMessages } from "@/hooks/message/use-get-messages";
import { useCreateMessage } from "@/hooks/message/use-create-message";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/hooks/use-socket";
import { AI_STATUS } from "@/types/ai-status.types";
import { useQueryClient } from "@tanstack/react-query";

export default function Chat({ conversationId }: { conversationId: string }) {
  const { data, isPending } = useGetMessages(conversationId);
  const { mutateAsync: createMessage } = useCreateMessage();
  const [aiThinking, setAiThinking] = useState(false);
  const [aiStream, setAiStream] = useState("");
  const [query, setQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const socket = useSocket();

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    socket.emit("join-conversation", conversationId);

    socket.on(
      "ai-status",
      ({ status, data }: { status: AI_STATUS; data?: string }) => {
        switch (status) {
          case "thinking":
            setAiThinking(true);
            break;

          case "finished":
            setAiThinking(false);
            queryClient
              .refetchQueries({
                queryKey: ["conversations", conversationId, "messages"],
              })
              .then(() => setAiStream(""));
            break;

          case "streaming":
            if (data) setAiStream((prev) => prev + data);
            break;
        }
      }
    );

    return () => {
      socket.emit("leave-conversation", conversationId);
    };
  }, [socket, conversationId, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiStream, data]);

  const handleSendMessage = async () => {
    if (query) {
      createMessage({ conversationId, content: query });
      setQuery("");
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {data &&
          data.messages.length > 0 &&
          data.messages.map((message) => (
            <div key={message.id} className="flex gap-3">
              <Avatar className="mt-3">
                <AvatarImage src="jpt" alt="User profile picture" />
                <AvatarFallback>BJ</AvatarFallback>
              </Avatar>
              <p
                className={cn("p-3 font-normal text-base", {
                  "rounded-lg bg-bg-level0": message.role === "user",
                  "": message.role === "assistant",
                })}
              >
                {message.content}
              </p>
            </div>
          ))}
        {data?.messages.length === 0 && <p>No messages</p>}

        {aiStream && (
          <div className="flex gap-3">
            <Avatar className="mt-3">
              <AvatarImage src="ai.jpg" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <p className="p-3 font-normal text-base rounded-lg bg-bg-level0">
              {aiStream}
            </p>
          </div>
        )}

        <div data-slot="scroll-into-view" ref={messagesEndRef} />
      </div>
      <div className="h-fit p-3 w-full">
        <div className="border rounded-lg border-border px-3 p-2 focus-within:ring focus-within:ring-primary">
          <TextArea
            className="h-10 drop-shadow-none placeholder:text-base text-base border-none focus:ring-0 p-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask AI something about your document"
            resizable={false}
          />
          <div className="flex justify-end">
            <IconButton
              size="32"
              onClick={handleSendMessage}
              loading={aiThinking}
            >
              <ArrowUp />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}
