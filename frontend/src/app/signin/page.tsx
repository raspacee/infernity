"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, InputWrapper } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import { Divider } from "@/components/ui/divider";
import { Spinner } from "@/components/ui/spinner";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import GoogleSignIn from "@/components/GoogleSignIn";
import Link from "next/link";
import { useSigninUser } from "@/hooks/user/use-signin-user";
import { SigninSchema, SigninSchemaType } from "@/lib/schemas";

export default function Page() {
  const { mutateAsync: signin, isPending } = useSigninUser();

  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function togglePasswordVisibility(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setShowPassword(!showPassword);
  }

  const IconComponent = showPassword ? EyeOffIcon : EyeIcon;

  const form = useForm<SigninSchemaType>({
    resolver: zodResolver(SigninSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: SigninSchemaType) => {
    signin(data);
  };

  return (
    <div className="bg-elevation-negative flex h-screen w-screen items-center justify-center px-5">
      <div className="border-border bg-bg flex w-100 rounded-2xl border lg:w-200">
        <div className="flex flex-1 flex-col gap-8 px-6 py-8 lg:px-7">
          <div>
            <Image
              src="/logo.svg"
              alt="Infernity Logo"
              width="48"
              height="48"
            />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="heading-5">Sign In</h1>
            <p className="text-fg-secondary text-sm font-normal">
              Don&apos;t have an account?{" "}
              <Link href="/signup" color="primary">
                Sign Up
              </Link>
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input size="36" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Link href="#" color="primary">
                          Forgot Password?
                        </Link>
                      </div>
                      <FormControl>
                        <InputWrapper>
                          <Input
                            {...field}
                            id="toggle-visible-password"
                            ref={inputRef}
                            className="peer"
                            type={showPassword ? "text" : "password"}
                          />
                          <IconComponent
                            className="hover:text-fg peer-disabled:text-fg-disabled cursor-pointer peer-disabled:pointer-events-none"
                            onMouseDown={togglePasswordVisibility}
                          />
                        </InputWrapper>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className="w-full" type="submit" disabled={isPending}>
                  {isPending ? <Spinner variant="default" /> : "Sign In"}
                </Button>
              </div>
            </form>
          </Form>
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-1.5">
              <Divider className="flex-1" />
              <span className="text-fg-secondary text-sm font-medium whitespace-nowrap">
                Or continue with
              </span>
              <Divider className="flex-1" />
            </div>
            <div className="flex">
              <GoogleSignIn />
            </div>
          </div>
        </div>
        <div className="hidden w-100 lg:block">
          <Image
            className="h-full w-full rounded-r-2xl"
            src="/signin-01/bg.png"
            alt="Background Image"
            width={400}
            height={400}
          />
        </div>
      </div>
    </div>
  );
}
