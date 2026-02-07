import { UserApi } from "@/api/user";
import { SignupSchemaType } from "@/lib/schemas";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSignupUser = () => {
  return useMutation({
    mutationFn: async (data: SignupSchemaType) => {
      try {
        return await UserApi.signupUser(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        throw new Error(err.message || "Signup failed");
      }
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
