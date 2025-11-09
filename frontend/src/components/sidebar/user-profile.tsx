import { useGetMyInfo } from "@/hooks/user/use-get-user-info";
import { EllipsisVertical, LogOut, Settings, Sprout } from "lucide-react";
import { getNameInitials } from "@/lib/helpers";
import {
  Dropdown,
  DropdownContent,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button, IconButton } from "@/components/ui/button";
import { useLogout } from "@/hooks/user/use-logout";

export default function UserProfile() {
  const { data: user } = useGetMyInfo();
  const { mutateAsync: logout, isPending } = useLogout();

  return (
    <footer className="flex items-center gap-2">
      <Avatar size="32" rounded="square">
        <AvatarImage src={user?.avatarUrl ?? undefined} />
        <AvatarFallback>{getNameInitials(user?.name ?? "")}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col text-sm leading-tight">
        <span className="font-medium">{user?.name}</span>
        <span className="text-text-tertiary text-xs">{user?.email}</span>
      </div>
      <Dropdown>
        <DropdownTrigger asChild>
          <IconButton variant="ghost" color="neutral" className="ml-auto">
            <EllipsisVertical />
          </IconButton>
        </DropdownTrigger>
        <DropdownContent align="end" className="min-w-75 shadow-sm">
          <DropdownLabel>{user?.email}</DropdownLabel>
          <DropdownItem>
            <Sprout />
            Upgrade Plan
          </DropdownItem>
          <DropdownItem>
            <Settings />
            Settings
          </DropdownItem>
          <DropdownDivider />
          <Dialog>
            <DialogTrigger asChild>
              <DropdownItem onSelect={(e) => e.preventDefault()}>
                <LogOut />
                Log out
              </DropdownItem>
            </DialogTrigger>
            <DialogContent backdrop="blur">
              <DialogHeader>
                <DialogTitle></DialogTitle>
                <DialogDescription>
                  Are you sure you want to logout?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button color="neutral" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  color="neutral"
                  onClick={() => logout()}
                  disabled={isPending}
                >
                  Log Out
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DropdownContent>
      </Dropdown>
    </footer>
  );
}
