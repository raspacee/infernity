"use client";

import Image from "next/image";
import LogoName from "../logo-name";
import SidebarItem, { SidebarItemType } from "./sidebar-item";
import { Book, Brain, DownloadCloud, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import UserProfileSkeleton from "./user-profile-skeleton";
import dynamic from "next/dynamic";
import { useSidebarContext } from "@/context/SidebarContext";

const UserProfile = dynamic(() => import("./user-profile"), {
  ssr: false,
  loading: () => <UserProfileSkeleton />,
});

const sidebarItems: SidebarItemType[] = [
  { name: "Conversations", icon: <Home size={20} />, link: "/conversations" },
  { name: "Summarise", icon: <DownloadCloud size={20} /> },
  { name: "Documents", icon: <Book size={20} /> },
  { name: "Insights", icon: <Brain size={20} /> },
];

// const MIN_WIDTH_FOR_SIDEBAR = 768;

export default function Sidebar() {
  const { open } = useSidebarContext();
  return (
    <aside
      className={cn(
        "flex flex-col gap-4 h-full w-80 border-r border-r-border p-3 bg-fill-level1 transition-all",
        { "w-0 overflow-hidden px-0": !open }
      )}
    >
      {/* For logo and header */}
      <header className="flex gap-2 px-3 py-2">
        <Image src="/logo.svg" height={36} width={48} alt="Logo" />
        <LogoName className="text-3xl" />
      </header>

      {/* For body and footer */}
      <div className="flex flex-col justify-between h-full">
        <nav className="flex flex-col gap-1">
          {sidebarItems.map((item) => (
            <SidebarItem item={item} key={item.name} />
          ))}
        </nav>

        {/* User profile */}
        <UserProfile />
      </div>
    </aside>
  );
}
