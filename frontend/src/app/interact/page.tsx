"use client";

import { IconButton } from "@/components/ui/button";
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
        },
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
        },
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
    <div className="bg-bg-level0 flex h-screen w-screen items-center justify-center">
      <div className="border-border bg-bg-base flex h-150 w-200 flex-col rounded-xl border p-3">
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
        <div className="flex flex-1 flex-col overflow-y-auto">
          {data && data.message}
        </div>
        <div className="border-border-alpha flex h-30 w-full rounded-xl border p-3">
          <TextArea
            // classNames={{
            //   base: "w-full",
            //   textarea: "border-none drop-shadow-none focus:ring-0 p-0",
            // }}
            resizable={false}
            placeholder="Ask something"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <IconButton variant="ghost" color="neutral">
            <Paperclip />
          </IconButton>
          <IconButton
            variant="ghost"
            color="neutral"
            onClick={handleSend}
            loading={isSendingMessage}
            disabled={isSendingMessage}
          >
            <Send />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
