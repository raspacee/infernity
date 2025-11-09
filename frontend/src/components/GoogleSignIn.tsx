"use client";

import Link from "next/link";
import { GoogleIcon } from "./GoogleIcon";
import { Button } from "./ui/button";

export default function GoogleSignIn() {
  return (
    <Button
      variant="outline"
      color="neutral"
      className="text-fg-secondary w-full"
      asChild
    >
      <Link href={new URL("api/auth/google", process.env.NEXT_PUBLIC_API_URL!)}>
        <GoogleIcon />
        Google
      </Link>
    </Button>
  );
}
