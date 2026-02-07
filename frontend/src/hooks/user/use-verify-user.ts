import { UserApi } from "@/api/user";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useVerifyUser = () => {
  const navigate = useRouter();

  return useMutation({
    mutationFn: async (verificationCode: string) => {
      return await UserApi.verifyRequest(verificationCode);
    },
    onSuccess: () => {
      navigate.push("/");
      toast.success("Your email is verified successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
