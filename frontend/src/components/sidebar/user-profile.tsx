import { useGetMyInfo } from "@/hooks/user/use-get-user-info";
import Image from "next/image";
import { Button } from "../ui/button";
import { EllipsisVertical } from "lucide-react";

export default function UserProfile() {
  const { data: user } = useGetMyInfo();

  return (
    <footer className="flex gap-2 items-center">
      <Image
        src={user.avatarUrl ?? ""}
        width={32}
        height={32}
        alt="Profile Picture"
        className="object-cover size-8 rounded-lg"
      />
      <div className="flex flex-col leading-tight text-sm">
        <span className="font-medium">{user?.name}</span>
        <span className="text-text-tertiary text-xs">{user?.email}</span>
      </div>
      <Button variant="ghost" color="neutral" className="ml-auto" iconOnly>
        <EllipsisVertical />
      </Button>
    </footer>
  );
}
