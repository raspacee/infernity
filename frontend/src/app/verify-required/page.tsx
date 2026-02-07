"use client";

import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { useGetMyInfo } from "@/hooks/user/use-get-user-info";
import { useLogout } from "@/hooks/user/use-logout";
import Image from "next/image";

export default function Page() {
  const { data: user, isPending: isLoadingInfo } = useGetMyInfo();
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();

  return (
    <div className="bg-bg flex h-screen w-screen items-center justify-center px-5">
      <div className="bg-bg flex w-100">
        <div className="flex flex-1 flex-col gap-8">
          <div className="text-fg flex items-center gap-2.5">
            <Image
              src="/logo.svg"
              alt="Infernity Logo"
              width="48"
              height="48"
            />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="heading-5">Verify your email</h1>
            <div>
              <p className="text-fg-secondary text-sm">
                We just sent an email to{" "}
                <span className="text-fg font-medium">{user?.email}</span>.
                Click the link in the email to verify your account.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {/* <Button className="w-full" type="submit">
              Resend email
            </Button> */}
            <Button
              className="w-full"
              color="error"
              variant="outline"
              type="submit"
              onClick={() => logout()}
              disabled={isLoggingOut}
            >
              Logout
            </Button>
          </div>

          <Divider />

          <div className="flex gap-3">
            <Button
              variant="outline"
              color="neutral"
              className="text-fg-secondary w-full"
              onClick={() =>
                window.open(
                  "https://gmail.com",
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              Open Gmail
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
