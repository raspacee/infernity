"use client";

import Chat from "@/components/conversations/chat";
import { useSidebarContext } from "@/context/SidebarContext";
import { useGetConversation } from "@/hooks/conversation/use-get-conversation";
import { useGetPresignedUrl } from "@/hooks/document/use-get-presigned-url";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useEffect } from "react";

const PDFViewer = dynamic(
  () => import("@/components/conversations/pdf-viewer"),
  { ssr: false, loading: () => <p>Loading...</p> }
);

export default function Page() {
  const params = useParams<{ conversationId: string }>();

  const { setIsOpen } = useSidebarContext();

  const { data, isPending: isConversationLoading } = useGetConversation(
    params.conversationId
  );

  const { data: pdf, isPending: isPdfLoading } = useGetPresignedUrl(
    params.conversationId,
    { enabled: !!data?.conversation.id }
  );

  useEffect(() => {
    setIsOpen(false);
  }, []);

  return (
    <div className="flex w-full h-full">
      <div className="border-r h-full border-border flex-1 overflow-auto">
        {isPdfLoading && <p>Loading...</p>}
        {pdf && data && (
          <PDFViewer document={data.document} presignedUrl={pdf.presignedUrl} />
        )}
      </div>
      <div className="flex-1">
        <Chat conversationId={params.conversationId} />
      </div>
    </div>
  );
}
