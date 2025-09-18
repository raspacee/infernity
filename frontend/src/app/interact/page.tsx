"use client";

import { Button } from "@/components/ui/button";
import FileUpload from "@/components/ui/file-upload";
import { TextArea } from "@/components/ui/text-area";
import { Paperclip, Send } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

type EmbeddingWithText = {
  embedding: number[];
  text: string;
};

type Message = {
  query: string;
};

export default function Page() {
  const [query, setQuery] = useState<string>("");

  const {
    mutateAsync: uploadDocument,
    isPending,
    isSuccess,
  } = useMutation<EmbeddingWithText[], Error, FormData>({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(
        new URL("/api/document/upload", process.env.NEXT_PUBLIC_API_URL),
        {
          method: "POST",
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error("Failed to upload document");
      }
      return response.json();
    },
    onSuccess: (data) => {
      console.log(data);
    },
  });

  const {
    mutateAsync: sendMessage,
    data,
    isPending: isSendingMessage,
  } = useMutation<{ message: string }, Error, Message>({
    mutationFn: async (data: Message) => {
      const response = await fetch(
        new URL("/api/llm/response", process.env.NEXT_PUBLIC_API_URL),
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to upload document");
      }
      return response.json();
    },
  });

  const handleSend = async () => {
    if (query) {
      await sendMessage({
        query,
      });
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-bg-level0">
      <div className="w-200 h-150 border-border border rounded-xl bg-bg-base flex flex-col p-3">
        <div className="">
          <FileUpload
            accept=".txt"
            onChange={(files) => {
              const formData = new FormData();
              if (files[0].file instanceof File) {
                formData.set("document", files[0].file);
                uploadDocument(formData);
              }
            }}
          />
          {isSuccess && <p>Successfully uploaded</p>}
          {isPending && <p>Uploading...</p>}
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col">
          {data && data.message}
        </div>
        <div className="flex h-30 border-border-alpha border w-full p-3 rounded-xl">
          <TextArea
            classNames={{
              base: "w-full",
              textarea: "border-none drop-shadow-none focus:ring-0 p-0",
            }}
            resizable={false}
            placeholder="Ask something"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button variant="ghost" color="neutral" iconOnly>
            <Paperclip />
          </Button>
          <Button
            variant="ghost"
            color="neutral"
            iconOnly
            onClick={handleSend}
            loading={isSendingMessage}
            disabled={isSendingMessage}
          >
            <Send />
          </Button>
        </div>
      </div>
    </div>
  );
}
