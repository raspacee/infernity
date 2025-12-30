"use client";

import Image from "next/image";
import LogoName from "../logo-name";
import SidebarItem, { SidebarItemType } from "./sidebar-item";
import { Book, Brain, DownloadCloud, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import UserProfileSkeleton from "./user-profile-skeleton";
import dynamic from "next/dynamic";
import { useSidebarContext } from "@/context/SidebarContext";
import Link from "next/link";

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
        "border-r-border bg-fill-level1 flex h-full w-80 flex-col gap-4 border-r p-3 transition-all",
        { "w-0 overflow-hidden px-0": !open },
      )}
    >
      {/* For logo and header */}
      <Link href="/" className="flex w-fit cursor-pointer gap-2 px-3 py-2">
        <Image src="/logo.svg" height={36} width={48} alt="Infernity Logo" />
        <LogoName className="text-3xl" />
      </Link>

      {/* For body and footer */}
      <div className="flex h-full flex-col justify-between">
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
