"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { Button, LinkButton } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Password } from "@/components/ui/password"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import Image from "next/image"
import { GoogleIcon } from "@/components/GoogleIcon"
import { GithubIcon } from "@/components/GithubIcon"
import { Divider } from "@/components/ui/divider"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"

const FormSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  rememberMe: z.boolean(),
})

export default function Page() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    console.log(data)
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      form.reset()
    }, 2000)
  }

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-bg px-5">
      <div className="w-100 flex bg-bg">
        <div className="flex-1 flex flex-col gap-8">
          <div className="flex-1 flex flex-col gap-8 items-center">
            <div>
              <Image
                src="/signin/Logo.svg"
                height={48}
                width={48}
                alt="Logo"
              />
            </div>
            <div className="flex gap-2 flex-col items-center">
              <h1 className=" heading-5">
                Welcome to Radian
              </h1>
              <p className="text-fg-secondary text-sm">
                First time here?{" "}
                <LinkButton href="#" color="primary">
                  Sign up
                </LinkButton>
              </p>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex gap-5 flex-col">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          size="36"
                          type="email"
                          {...field}
                        />
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
                        <Password size="36" placeholder="" toggleVisibility="never" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-between items-center">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            id="remember-me"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel htmlFor="remember-me" className="font-normal text-fg-secondary">
                          Remember me
                        </FormLabel>
                      </div>
                    )}
                  />
                  <LinkButton href="#" color="primary">
                    Forgot Password?
                  </LinkButton>
                </div>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner variant="default" /> : "Sign In"}
                </Button>
              </div>
            </form>
          </Form>
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex gap-2 items-center">
              <Divider className="flex-1" />
              <span className="text-fg-tertiary text-sm whitespace-nowrap font-medium">
                Or continue with
              </span>
              <Divider className="flex-1" />
            </div>
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                color="neutral"
                className="w-full text-fg-secondary"
              >
                <GoogleIcon />
                Continue with Google
              </Button>
              <Button
                variant="outline"
                color="neutral"
                className="w-full text-fg-secondary"
              >
                <GithubIcon />
                Continue with Github
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}