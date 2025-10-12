import { useGetUserConversations } from "@/hooks/conversation/use-get-user-conversations";
import { Skeleton } from "@/components/ui/skeleton";
import { IconButton } from "@/components/ui/button";
import {
  Dropdown,
  DropdownContent,
  DropdownDivider,
  DropdownItem,
  DropdownTrigger,
} from "../ui/dropdown";
import { EllipsisVertical, FolderPen, Trash2 } from "lucide-react";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import UpdateConversationForm from "./update-conversation-form";

export default function ConversationsList() {
  const { data: result, isLoading, isSuccess } = useGetUserConversations();

  const router = useRouter();

  if (isLoading)
    return (
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-20 max-w-full" />
        <Skeleton className="h-20 max-w-full" />
        <Skeleton className="h-20 max-w-full" />
      </div>
    );

  return (
    <div className="flex flex-col gap-3 p-4">
      {isSuccess &&
        result.conversations.map((conversation) => (
          <div
            key={conversation.id}
            className="border-border flex h-20 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3"
            onClick={() => router.push(`/conversations/${conversation.id}`)}
          >
            <div className="">
              <p className="text-base leading-7 font-medium">
                {conversation.title}
              </p>
              <p className="text-text-tertiary text-sm">
                {DateTime.fromSQL(conversation.createdAt).toLocaleString(
                  DateTime.DATE_MED_WITH_WEEKDAY,
                )}
              </p>
            </div>
            <Dropdown>
              <DropdownTrigger
                asChild
                className="ml-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <IconButton size="28" variant="ghost" color="neutral">
                  <EllipsisVertical />
                </IconButton>
              </DropdownTrigger>
              <DropdownContent align="end" onClick={(e) => e.stopPropagation()}>
                <Dialog>
                  <DialogTrigger asChild>
                    <DropdownItem onSelect={(e) => e.preventDefault()}>
                      <FolderPen />
                      Rename conversation
                    </DropdownItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rename Conversation</DialogTitle>
                    </DialogHeader>

                    <UpdateConversationForm conversation={conversation} />
                  </DialogContent>
                </Dialog>
                <DropdownDivider />
                <DropdownItem>
                  <Trash2 />
                  Delete
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          </div>
        ))}
    </div>
  );
}
