"use client";

import Chat from "@/components/conversations/chat";
import { DocumentContextProvider } from "@/context/DocumentContext";
import { useSidebarContext } from "@/context/SidebarContext";
import { useGetConversation } from "@/hooks/conversation/use-get-conversation";
import { useGetDocuments } from "@/hooks/document/use-get-documents";
import { useGetPresignedUrl } from "@/hooks/document/use-get-presigned-url";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useEffect } from "react";

const PDFViewer = dynamic(
  () => import("@/components/conversations/pdf-viewer"),
  { ssr: false, loading: () => <p>Loading...</p> },
);

export default function Page() {
  const params = useParams<{ conversationId: string }>();

  const { setIsOpen } = useSidebarContext();

  const { data, isPending: isConversationLoading } = useGetConversation(
    params.conversationId,
  );

  const { data: pdf, isPending: isPdfLoading } = useGetPresignedUrl(
    params.conversationId,
    { enabled: !!data?.conversation.id },
  );

  const { data: documentsPresignedUrls, isPending: isDocumentsLoading } =
    useGetDocuments(params.conversationId, {
      enabled: !!data?.conversation.id,
    });

  useEffect(() => {
    setIsOpen(false);
  }, []);

  if (isConversationLoading || isPdfLoading || isDocumentsLoading) {
    return <p>Loading...</p>;
  }

  if (!documentsPresignedUrls) {
    return <p>No documents found</p>;
  }

  return (
    <DocumentContextProvider
      documentsPresignedUrls={documentsPresignedUrls!.presignedUrls}
    >
      <div className="flex h-full w-full">
        <div className="border-border h-full flex-1 overflow-auto border-r">
          {isPdfLoading && <p>Loading...</p>}
          {pdf && data && <PDFViewer />}
        </div>
        <div className="flex-1">
          <Chat conversationId={params.conversationId} />
        </div>
      </div>
    </DocumentContextProvider>
  );
}
