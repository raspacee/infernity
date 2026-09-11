"use client";

import { useVerifyUser } from "@/hooks/user/use-verify-user";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const verificationToken = searchParams.get("token");
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

export default function Page() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
