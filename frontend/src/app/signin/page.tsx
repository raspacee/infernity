import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Password } from "@/components/ui/password";
import Link from "next/link";
import Image from "next/image";
import { GithubIcon } from "@/components/GithubIcon";
import { Divider } from "@/components/ui/divider";
import GoogleSignIn from "@/components/GoogleSignIn";

export default function Page() {
  return (
    <div className="h-screen w-screen flex justify-center items-center bg-bg-level2 px-5">
      <div className="w-200 flex rounded-2xl border border-border bg-bg-base">
        <div className="flex-1 px-8 py-10 flex flex-col gap-6">
          <div className="flex gap-2 items-center">
            <Image src="/logo.svg" height={32} width={40} alt="Logo" />
            <h3 className="text-xl font-semibold bg-gradient-to-r from-violet-900 via-indigo-700 to-violet-600 bg-clip-text text-transparent tracking-tight">
              Infernity
            </h3>
          </div>
          <div className="flex gap-2 flex-col">
            <h1 className="text-text text-2xl font-bold antialiased">
              Sign In
            </h1>
            <p>
              Don&apos;t have an account?{" "}
              <Link href="#" className="text-primary">
                Sign Up
              </Link>
            </p>
          </div>
          <div className="flex gap-5 flex-col">
            <Input label="Email Address" />
            <Password label="Password" size="36" />
            <Button className="w-full">Sign In</Button>
          </div>
          <div className="flex gap-1.5 items-center">
            <Divider />
            <span className="text-text-tertiary text-sm whitespace-nowrap font-medium">
              Or continue with
            </span>
            <Divider />
          </div>
          <div className="flex gap-3">
            <GoogleSignIn />
            <Button
              variant="outline"
              color="neutral"
              className="w-full text-text-secondary"
            >
              <GithubIcon />
              Github
            </Button>
          </div>
        </div>
        <div className="w-100 hidden lg:block">
          <img
            className="h-full w-full rounded-r-2xl"
            src="/signin-01/bg.png"
          />
        </div>
      </div>
    </div>
  );
}
