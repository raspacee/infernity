"use client";

import { useVerifyUser } from "@/hooks/user/use-verify-user";
import { useEffect } from "react";

export default function Page() {
  const search = new URLSearchParams(location.search);
  const verificationToken = search.get("token");
  const { mutateAsync: verifyUser } = useVerifyUser();

  useEffect(() => {
    if (!verificationToken) return;

    verifyUser(verificationToken);
  }, [verificationToken, verifyUser]);

  if (!verificationToken) {
    return <h1>Verification token is missing</h1>;
  }

  return (
    <div className="p-3">
      <h1 className="text-lg">Verifying your email, please wait</h1>
    </div>
  );
}
