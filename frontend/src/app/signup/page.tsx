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
import { Divider } from "@/components/ui/divider";
import { Spinner } from "@/components/ui/spinner";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import GoogleSignIn from "@/components/GoogleSignIn";
import { useSignupUser } from "@/hooks/user/use-signup-user";
import { SignupSchema, SignupSchemaType } from "@/lib/schemas";

export default function Page() {
  const { mutateAsync: signupUser, isPending: isSigningUp } = useSignupUser();

  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function togglePasswordVisibility(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setShowPassword(!showPassword);
  }

  const IconComponent = showPassword ? EyeOffIcon : EyeIcon;

  const form = useForm<SignupSchemaType>({
    resolver: zodResolver(SignupSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: SignupSchemaType) => {
    signupUser(data);
  };

  return (
    <div className="bg-bg flex h-screen w-screen items-center justify-center px-5">
      <div className="bg-bg border-border flex w-100 rounded-2xl border px-6 py-8">
        <div className="flex flex-1 flex-col gap-8">
          <div>
            <Image
              src="/logo.svg"
              alt="Infernity Logo"
              width="48"
              height="48"
            />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="heading-5">Sign Up</h1>
            <p className="text-fg-secondary text-sm">
              Already have an account?{" "}
              <Button variant="link" asChild color="primary">
                <Link href="/signin">Sign in</Link>
              </Button>
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input size="36" type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                        <FormLabel>Password</FormLabel>
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
                </div>
                <div className="flex flex-col gap-4">
                  <Button
                    className="w-full"
                    type="submit"
                    disabled={isSigningUp}
                  >
                    {isSigningUp ? (
                      <Spinner variant="default" />
                    ) : (
                      "Create account"
                    )}
                  </Button>
                  <p className="text-fg-secondary text-[13px]">
                    By signing up, you agree to Infernity&apos;s{" "}
                    <Button variant="link" asChild color="primary">
                      <Link href="#" className="text-[13px]">
                        Terms of Service
                      </Link>
                    </Button>{" "}
                    and{" "}
                    <Button variant="link" asChild color="primary">
                      <Link href="#" className="text-[13px]">
                        Privacy Policy
                      </Link>
                    </Button>
                  </p>
                </div>
              </div>
            </form>
          </Form>
          <div className="flex flex-1 flex-col gap-6">
            <div className="flex items-center gap-2">
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
      </div>
    </div>
  );
}
