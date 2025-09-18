import { useGetUserConversations } from "@/hooks/conversation/use-get-user-conversations";
import { Skeleton } from "../ui/skeleton";
import { Button, IconButton } from "../ui/button";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "../ui/dropdown";
import { EllipsisVertical } from "lucide-react";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";

export default function ConversationsList() {
  const { data: result, isLoading, isSuccess } = useGetUserConversations();
  const router = useRouter();

  if (isLoading)
    return (
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="max-w-full h-20" />
        <Skeleton className="max-w-full h-20" />
        <Skeleton className="max-w-full h-20" />
      </div>
    );

  return (
    <div className="flex flex-col gap-3 p-4">
      {isSuccess &&
        result.conversations.map((conversation) => (
          <div
            key={conversation.id}
            className="flex gap-3 h-20 cursor-pointer border border-border py-3 px-4 rounded-lg items-center"
            onClick={() => router.push(`/conversations/${conversation.id}`)}
          >
            <div className="">
              <p className="text-base font-medium leading-7">
                {conversation.title}
              </p>
              <p className="text-text-tertiary text-sm">
                {DateTime.fromSQL(conversation.createdAt).toLocaleString(
                  DateTime.DATE_MED_WITH_WEEKDAY
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
              <DropdownContent align="end">
                <DropdownItem>Rename conversation</DropdownItem>
                <DropdownItem>Delete</DropdownItem>
              </DropdownContent>
            </Dropdown>
          </div>
        ))}
    </div>
  );
}
