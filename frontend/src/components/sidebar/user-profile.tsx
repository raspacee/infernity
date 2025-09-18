import { useGetMyInfo } from "@/hooks/user/use-get-user-info";
import Image from "next/image";
import { IconButton } from "../ui/button";
import { EllipsisVertical } from "lucide-react";

export default function UserProfile() {
  const { data: user } = useGetMyInfo();

  return (
    <footer className="flex gap-2 items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={user?.avatarUrl ?? undefined}
        width={32}
        height={32}
        alt="Profile Picture"
        className="object-cover size-8 rounded-lg"
      />
      <div className="flex flex-col leading-tight text-sm">
        <span className="font-medium">{user?.name}</span>
        <span className="text-text-tertiary text-xs">{user?.email}</span>
      </div>
      <IconButton variant="ghost" color="neutral" className="ml-auto">
        <EllipsisVertical />
      </IconButton>
    </footer>
  );
}
