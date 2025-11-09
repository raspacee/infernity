"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRef, useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
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
import { GoogleIcon } from "@/components/GoogleIcon";
import { GithubIcon } from "@/components/GithubIcon";
import { Divider } from "@/components/ui/divider";
import { Spinner } from "@/components/ui/spinner";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Logo from "@/components/Logo";
import GoogleSignIn from "@/components/GoogleSignIn";

const FormSchema = z
  .object({
    email: z.string(),
    password: z.string(),
  })
  .superRefine((data, ctx) => {
    // Validate email first
    if (!data.email || data.email.trim().length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Email is required",
        path: ["email"],
      });
      return; // Stop here
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      ctx.addIssue({
        code: "custom",
        message: "Please enter a valid email address",
        path: ["email"],
      });
      return; // Stop here - don't validate password
    }

    // Only validate password if email is valid
    if (!data.password || data.password.trim().length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Password is required",
        path: ["password"],
      });
    }
  });

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function togglePasswordVisibility(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setShowPassword(!showPassword);
  }

  const IconComponent = showPassword ? EyeOffIcon : EyeIcon;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    console.log(data);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      form.reset();
    }, 2000);
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
              <LinkButton href="#" color="primary">
                Sign Up
              </LinkButton>
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
                        <LinkButton href="#" color="primary">
                          Forgot Password?
                        </LinkButton>
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
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner variant="default" /> : "Sign In"}
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
            <div className="flex gap-3">
              <GoogleSignIn />
              <Button
                variant="outline"
                color="neutral"
                className="text-fg-secondary w-full"
              >
                <GithubIcon />
                Github
              </Button>
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
