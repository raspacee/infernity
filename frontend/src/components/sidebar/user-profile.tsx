import { useGetMyInfo } from "@/hooks/user/use-get-user-info";
import Image from "next/image";
import { IconButton } from "../ui/button";
import { EllipsisVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getNameInitials } from "@/lib/helpers";

export default function UserProfile() {
  const { data: user } = useGetMyInfo();

  return (
    <footer className="flex gap-2 items-center">
      <Avatar size="32" rounded="square">
        <AvatarImage src={user?.avatarUrl ?? undefined} />
        <AvatarFallback>{getNameInitials(user?.name ?? "")}</AvatarFallback>
      </Avatar>
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
