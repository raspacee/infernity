import { EllipsisVertical } from "lucide-react";
import { IconButton } from "../ui/button";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "../ui/dropdown";
import { Checkbox } from "../ui/checkbox";
import { type SourceItem } from "@/types/document.types";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function SourceItem({
  source,
  toggleDocumentQueryable,
  conversationId,
}: {
  source: SourceItem;
  toggleDocumentQueryable: (variables: {
    conversationId: string;
    documentId: string;
  }) => void;
  conversationId: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1">
        <Dropdown>
          <DropdownTrigger asChild>
            <IconButton size="28" variant="ghost">
              <EllipsisVertical />
            </IconButton>
          </DropdownTrigger>
          <DropdownContent className="z-[1000]">
            <DropdownItem>Delete Source</DropdownItem>
          </DropdownContent>
        </Dropdown>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="truncate">{source.originalFileName}</span>
          </TooltipTrigger>
          <TooltipContent>{source.originalFileName}</TooltipContent>
        </Tooltip>
      </div>
      <Checkbox
        checked={source.isQueryable}
        onCheckedChange={() =>
          toggleDocumentQueryable({ conversationId, documentId: source.id })
        }
      />
    </div>
  );
}
