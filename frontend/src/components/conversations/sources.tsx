import { FileStack, Plus } from "lucide-react";
import { Button, IconButton } from "../ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Divider } from "../ui/divider";
import { useGetConversationSources } from "@/hooks/conversation/use-get-conversation-sources";
import { useParams } from "next/navigation";
import SourceItem from "../source/source-item";
import { Label } from "../ui/label";
import { useAddDocument } from "@/hooks/document/use-add-document";

export default function Sources() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { mutateAsync: addDocument, isPending: isAddingDocument } =
    useAddDocument();

  const { data: sources, isPending } =
    useGetConversationSources(conversationId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      addDocument({ file, conversationId });
    } else {
      alert("Only PDF is supported");
    }
  };

  console.log(sources);

  return (
    <Drawer variant="float" direction="left" backdrop="blur">
      <Tooltip>
        <TooltipTrigger asChild>
          <DrawerTrigger asChild>
            <IconButton size="28" color="neutral" variant="ghost">
              <FileStack size={20} />
            </IconButton>
          </DrawerTrigger>
        </TooltipTrigger>
        <TooltipContent>Sources</TooltipContent>
      </Tooltip>
      <DrawerContent className="w-100">
        <DrawerTitle className="heading-4!">Sources</DrawerTitle>
        <Divider />
        <Button
          asChild
          className="w-full"
          variant="glossy"
          disabled={isAddingDocument}
        >
          <Label htmlFor="document">
            <Plus />
            {isAddingDocument ? "Adding Source..." : "Add Source"}
          </Label>
        </Button>
        <input
          type="file"
          className="hidden"
          id="document"
          accept=".pdf"
          onChange={handleFileChange}
        />
        <div className="mt-4">
          <p className="text-fg-secondary text-base font-semibold">
            Select sources
          </p>
          <div className="mt-2 flex flex-col gap-3">
            {sources &&
              sources.map((source) => (
                <SourceItem key={source.id} source={source} />
              ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
