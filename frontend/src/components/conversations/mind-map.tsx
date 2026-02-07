"use client";

import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyAction,
} from "@/components/ui/empty";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button, IconButton } from "../ui/button";
import { Brain, Database } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import MermaidDiagram from "../mermaid/mermaid-diagram";
import { Spinner } from "../ui/spinner";
import { useQueryClient } from "@tanstack/react-query";
import { useGetMindMap } from "@/hooks/mindmap/use-get-mindmap";
import { useCreateMindMap } from "@/hooks/mindmap/use-create-mindmap";
import { useEffect, useState } from "react";
import { MIND_MAP_STATUS } from "@/types/mindmap-status.types";
import { useParams } from "next/navigation";
import { useSocket } from "@/hooks/use-socket";

export default function MindMap() {
  const { conversationId } = useParams<{ conversationId: string }>();

  const [mindMapStatus, setMindMapStatus] = useState<MIND_MAP_STATUS | null>(
    null,
  );

  const { data: mindMap, isPending: isLoadingMindMap } =
    useGetMindMap(conversationId);
  const { mutateAsync: createMindMap, isPending: isCreatingMindMap } =
    useCreateMindMap();

  const socket = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    socket.emit("join-conversation", conversationId);

    socket.on(
      "mindmap-status",
      ({
        status,
      }: {
        status: MIND_MAP_STATUS;
        data?: string;
        jobId?: string;
      }) => {
        setMindMapStatus(status);
        if (status == "finished") {
          queryClient.refetchQueries({
            queryKey: ["conversations", conversationId, "mindmap"],
          });
        }
      },
    );

    return () => {
      socket.emit("leave-conversation", conversationId);
    };
  }, [socket, conversationId, queryClient]);

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <IconButton size="28" color="neutral" variant="ghost">
              <Brain size={20} />
            </IconButton>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Mind Map</TooltipContent>
      </Tooltip>
      <DialogContent className="h-full max-h-[90%] w-full max-w-[90%]">
        <DialogTitle className="heading-4!">Mind Map</DialogTitle>
        <Button
          onClick={() => createMindMap(conversationId)}
          disabled={isCreatingMindMap || mindMapStatus === "creating"}
          size="40"
        >
          {mindMapStatus == "creating"
            ? "Creating Mind Map"
            : "Create Mind Map"}
        </Button>

        {isLoadingMindMap === true && (
          <div className="flex h-full w-full items-center justify-center">
            <Spinner size={44} variant="default" />
          </div>
        )}

        {mindMap === null && (
          <Empty>
            <EmptyMedia
              variant="icon"
              className="border-soft rounded-full border shadow-2xs"
            >
              <span className="bg-bg border-soft flex items-center justify-center rounded-[inherit] border p-3.5 shadow-2xs">
                <Database />
              </span>
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No Mind Map Generated</EmptyTitle>
              <EmptyDescription>
                You haven’t created mind mapping yet. Create your first one to
                get started
              </EmptyDescription>
            </EmptyHeader>
            <EmptyAction>
              <Button
                onClick={() => createMindMap(conversationId)}
                disabled={isCreatingMindMap || mindMapStatus === "creating"}
                size="40"
              >
                {mindMapStatus == "creating"
                  ? "Creating Mind Map"
                  : "Create Mind Map"}
              </Button>
            </EmptyAction>
          </Empty>
        )}

        {mindMap !== null && mindMap !== undefined && (
          <MermaidDiagram chart={mindMap.chartCode} />
        )}
      </DialogContent>
    </Dialog>
  );
}
