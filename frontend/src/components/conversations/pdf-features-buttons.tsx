"use client";

import { DateTime } from "luxon";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button, IconButton } from "../ui/button";
import { Database, Zap } from "lucide-react";
import { useParams } from "next/navigation";
import { useCreateFlashCards } from "@/hooks/flashcards/use-create-flashcards";
import { useSocket } from "@/hooks/use-socket";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FLASHCARDS_STATUS } from "@/types/flashcards-status.types";
import { useGetFlashCards } from "@/hooks/flashcards/use-get-flashcards";
import { Card, CardFooter, CardTitle } from "../ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import FlashCard from "../flashcard/flashcard";

export default function PdfFeaturesButtons() {
  const [flashCardsStatus, setFlashCardsStatus] =
    useState<FLASHCARDS_STATUS | null>(null);

  const { conversationId } = useParams<{ conversationId: string }>();

  const { data: flashCards = [] } = useGetFlashCards(conversationId);

  const { mutateAsync: createFlashCards, isPending } = useCreateFlashCards();

  const socket = useSocket();

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    socket.emit("join-conversation", conversationId);

    socket.on(
      "flashcards-status",
      ({
        status,
        data,
        jobId,
      }: {
        status: FLASHCARDS_STATUS;
        data?: string;
        jobId?: string;
      }) => {
        setFlashCardsStatus(status);
        if (status == "finished") {
          queryClient.refetchQueries({
            queryKey: ["conversations", conversationId, "flashcards"],
          });
        }
      },
    );

    return () => {
      socket.emit("leave-conversation", conversationId);
    };
  }, [socket, conversationId, queryClient]);

  return (
    <div className="ml-10">
      <Dialog>
        <DialogTrigger asChild>
          <IconButton size="28" color="neutral" variant="ghost">
            <Zap size={20} />
          </IconButton>
        </DialogTrigger>
        <DialogContent className="max-h-[90%] min-w-1/2 overflow-y-scroll">
          <DialogTitle>
            <h4 className="heading-4">Flash Cards</h4>
          </DialogTitle>
          {flashCards.length > 0 && (
            <DialogHeader>
              <Button
                onClick={() => createFlashCards(conversationId)}
                disabled={isPending || flashCardsStatus === "creating"}
              >
                {flashCardsStatus == "creating"
                  ? "Creating Flash Card"
                  : "Create Flash Card"}
              </Button>
            </DialogHeader>
          )}
          <div className="flex flex-wrap gap-4">
            {flashCards.length > 0 &&
              flashCards.map((flashCard) => (
                <Dialog key={flashCard.groupingId}>
                  <DialogTrigger asChild>
                    <Card className="size-35 shrink-0 cursor-pointer p-3">
                      <CardTitle>{flashCard.title}</CardTitle>
                      <CardFooter className="mt-auto px-0">
                        <span className="text-fg-secondary text-[13px] font-medium">
                          {DateTime.fromSQL(flashCard.createdAt).toRelative()}
                        </span>
                      </CardFooter>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="bg-fill4 h-full max-h-3/4 w-full max-w-1/2 items-center justify-center">
                    <DialogTitle sr-only="" />
                    <Carousel className="w-2/3">
                      <CarouselContent>
                        {flashCard.flashCards.map((fc, index) => (
                          <CarouselItem key={index}>
                            <FlashCard
                              frontContent={fc.frontContent}
                              backContent={fc.backContent}
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  </DialogContent>
                </Dialog>
              ))}
          </div>
          {flashCards.length == 0 && (
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
                <EmptyTitle>No Flash Cards Yet</EmptyTitle>
                <EmptyDescription>
                  You haven’t created any flash cards yet. Create your first one
                  to get started
                </EmptyDescription>
              </EmptyHeader>
              <EmptyAction>
                <Button
                  onClick={() => createFlashCards(conversationId)}
                  disabled={isPending || flashCardsStatus === "creating"}
                >
                  {flashCardsStatus == "creating"
                    ? "Creating Flash Card"
                    : "Create Flash Card"}
                </Button>
              </EmptyAction>
            </Empty>
          )}
          {flashCardsStatus}
        </DialogContent>
      </Dialog>
    </div>
  );
}
