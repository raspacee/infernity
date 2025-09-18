import { EllipsisVertical } from "lucide-react";
import { IconButton } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

export default function UserProfileSkeleton() {
  return (
    <footer className="flex gap-2 items-center">
      <Skeleton className="size-8 rounded-lg shrink-0" />
      <div className="flex flex-col gap-1 leading-tight text-sm w-full">
        <Skeleton className="h-8 w-40" />
      </div>
      <IconButton variant="ghost" color="neutral" className="ml-auto">
        <EllipsisVertical size={20} />
      </IconButton>
    </footer>
  );
}
