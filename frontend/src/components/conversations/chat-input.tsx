import { useState } from "react";
import { TextArea } from "../ui/text-area";
import { IconButton } from "../ui/button";
import { ArrowUp, Square } from "lucide-react";

export default function ChatInput({
  handleSendMessage,
  handleStopStreaming,
  aiThinking,
  aiStreaming,
}: {
  handleSendMessage: (query: string) => Promise<void>;
  handleStopStreaming: () => void;
  aiThinking: boolean;
  aiStreaming: boolean;
}) {
  const [query, setQuery] = useState("");

  return (
    <div className="border rounded-lg border-border px-3 p-2 focus-within:ring focus-within:ring-primary">
      <TextArea
        className="h-10 drop-shadow-none placeholder:text-base text-base border-none focus:ring-0 p-0"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask AI something about your document"
        resizable={false}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && query.trim() !== "") {
            e.preventDefault();
            handleSendMessage(query);
            setQuery("");
          }
        }}
      />
      <div className="flex justify-end">
        {(aiThinking || aiStreaming) && (
          <IconButton
            size="32"
            onClick={(e) => {
              e.preventDefault();
              handleStopStreaming();
            }}
            color="neutral"
            variant="outline"
          >
            <Square className="fill-fg-secondary stroke-fg-secondary size-4!" />
          </IconButton>
        )}
        {!aiThinking && !aiStreaming && (
          <IconButton
            size="32"
            onClick={() => {
              if (query.trim() !== "") {
                handleSendMessage(query);
                setQuery("");
              }
            }}
          >
            <ArrowUp />
          </IconButton>
        )}
      </div>
    </div>
  );
}
