import { TextArea } from "@/components/ui/text-area";
import { CompactButton, IconButton } from "@/components/ui/button";
import { ArrowUp, Square, X } from "lucide-react";
import { useDocumentContext } from "@/context/DocumentContext";

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
  const { selectedImage, setSelectedImage, chatInputRef } =
    useDocumentContext();

  return (
    <div className="border-border focus-within:ring-primary space-y-2 rounded-lg border p-2 px-3 focus-within:ring">
      {selectedImage && (
        <div className="relative w-fit">
          <img
            src={URL.createObjectURL(selectedImage)}
            className="bg-black-inverse h-30 w-50 object-contain"
          />
          <CompactButton
            size="20"
            variant="ghost"
            color="neutral"
            className="absolute top-1 right-1 hover:bg-transparent"
            onClick={() => setSelectedImage(null)}
          >
            <X />
          </CompactButton>
        </div>
      )}
      <TextArea
        ref={chatInputRef}
        className="h-10 border-none p-0 text-base drop-shadow-none placeholder:text-base focus:ring-0"
        placeholder="Ask AI something about your document"
        resizable={false}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            chatInputRef.current != null &&
            !e.shiftKey
          ) {
            e.preventDefault();
            handleSendMessage(chatInputRef.current.value);
            chatInputRef.current.value = "";
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
              if (chatInputRef.current != null) {
                handleSendMessage(chatInputRef.current.value);
                chatInputRef.current.value = "";
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
