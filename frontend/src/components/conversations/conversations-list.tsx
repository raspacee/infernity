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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";

function NoInternetConnectionMediaContent(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={136}
      height={96}
      viewBox="0 0 136 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g filter="url(#filter0_d_1634_2488)">
        <rect
          x={8}
          y={4}
          width={120}
          height={80}
          rx={8}
          className="fill-bg"
          shapeRendering="crispEdges"
        />
        <rect
          x={8.5}
          y={4.5}
          width={119}
          height={79}
          rx={7.5}
          className="stroke-soft"
          shapeRendering="crispEdges"
        />
        <path
          d="M26.0808 18V70"
          className="stroke-border"
          strokeDasharray="2 2"
        />
        <rect
          x={18.5}
          y={14.5}
          width={15}
          height={15}
          rx={7.5}
          className="fill-fill2 stroke-soft"
        />
        <rect
          x={40}
          y={16}
          width={78}
          height={4}
          rx={1}
          className="fill-soft"
        />
        <rect
          x={40}
          y={24}
          width={52}
          height={4}
          rx={1}
          className="fill-soft"
        />
        <rect
          x={18.5}
          y={36.5}
          width={15}
          height={15}
          rx={7.5}
          className="stroke-primary-border fill-primary-focus"
          strokeLinecap="round"
        />
        <rect
          x={40}
          y={38}
          width={78}
          height={4}
          rx={1}
          className="fill-soft"
        />
        <rect
          x={40}
          y={46}
          width={52}
          height={4}
          rx={1}
          className="fill-soft"
        />
        <rect
          x={18.5}
          y={58.5}
          width={15}
          height={15}
          rx={7.5}
          className="stroke-soft fill-fill2"
        />
        <rect
          x={40}
          y={60}
          width={78}
          height={4}
          rx={1}
          className="fill-soft"
        />
        <rect
          x={40}
          y={68}
          width={52}
          height={4}
          rx={1}
          className="fill-soft"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_1634_2488"
          x={0}
          y={0}
          width={136}
          height={96}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy={4} />
          <feGaussianBlur stdDeviation={4} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0980392 0 0 0 0 0.0941176 0 0 0 0 0.105882 0 0 0 0.08 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_1634_2488"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_1634_2488"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}

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
      {isSuccess && result.conversations.length === 0 && (
        <Empty>
          <EmptyMedia>
            <NoInternetConnectionMediaContent />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No Recent Activity</EmptyTitle>
            <EmptyDescription>
              You have not started any session yet
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
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
