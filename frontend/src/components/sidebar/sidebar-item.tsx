import Link from "next/link";
import React from "react";

export type SidebarItemType = {
  name: string;
  icon: React.ReactNode;
  link?: string;
};

type SidebarItemProps = { item: SidebarItemType };

export default function SidebarItem({ item }: SidebarItemProps) {
  const { name, icon, link = "#" } = item;

  return (
    <Link
      className="w-full text-sm font-medium flex gap-2 items-center px-3 py-2 hover:bg-bg-level0 text-text-secondary"
      href={link}
    >
      {icon}
      <span className="">{name}</span>
    </Link>
  );
}
