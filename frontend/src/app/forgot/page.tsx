"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Password } from "@/components/ui/password"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import Image from "next/image"
import { Spinner } from "@/components/ui/spinner"

const FormSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
})

export default function Page() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: "",
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
          <div className="flex-1 flex flex-col gap-6">
            <div>
              <Image
                src="/forgot-password/Logo.svg"
                height={32}
                width={32}
                alt="Logo"
              />
            </div>
            <div className="flex gap-2 flex-col">
              <h1 className="heading-5">
                Change Your Password
              </h1>
              <p className="text-fg-secondary text-sm">
                Enter a new password below to change your password.
              </p>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex gap-5 flex-col">
                <div className="flex gap-4 flex-col">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New password</FormLabel>
                        <FormControl>
                          <Password size="36" placeholder=""  {...field} />
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
                        <FormLabel>Re-enter new password</FormLabel>
                        <FormControl>
                          <Password size="36" placeholder="" toggleVisibility="never" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner variant="default" /> : "Reset password"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}