import Sources from "./sources";
import FlashCards from "./flash-cards";
import MindMap from "./mind-map";
import { useGetConversationSources } from "@/hooks/conversation/use-get-conversation-sources";
import { useParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { useDocumentContext } from "@/context/DocumentContext";

export default function PdfFeaturesButtons() {
  const { conversationId } = useParams<{ conversationId: string }>();

  const { data: sources, isPending } =
    useGetConversationSources(conversationId);

  const { activeDocumentId, setActiveDocumentId } = useDocumentContext();

  return (
    <div className="ml-10 flex gap-2">
      <FlashCards />
      <MindMap />
      <Sources />

      <Tabs value={activeDocumentId || ""}>
        <TabsList variant="open">
          {sources?.map((source) => (
            <TabsTrigger
              className="max-w-25 justify-start truncate text-start"
              key={source.id}
              value={source.id}
              onClick={() => setActiveDocumentId(source.id)}
            >
              {source.originalFileName}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
