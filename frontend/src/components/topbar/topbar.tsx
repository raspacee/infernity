"use client";

import { MessageSquarePlus, PanelLeft } from "lucide-react";
import { Button, IconButton } from "../ui/button";
import { Divider } from "../ui/divider";
import { useRouter } from "next/navigation";
import { useSidebarContext } from "@/context/SidebarContext";

export default function Topbar() {
  const { setIsOpen } = useSidebarContext();
  const router = useRouter();

  return (
    <div className="h-13 border-b border-b-border flex items-center gap-3 px-5 py-3">
      <IconButton
        size="32"
        variant="ghost"
        color="neutral"
        onClick={() => setIsOpen((prev: boolean) => !prev)}
      >
        <PanelLeft size={20} />
      </IconButton>

      <Divider orientation={"vertical"} />

      <p className="text-base font-medium">Conversations</p>

      <Button
        size="32"
        className="ml-auto mr-2 gap-1"
        onClick={() => router.push("/conversations/create")}
      >
        <MessageSquarePlus size={20} />
        New Session
      </Button>
    </div>
  );
}
