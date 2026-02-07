import { UserApi } from "@/api/user";
import { SigninSchemaType } from "@/lib/schemas";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useSigninUser = () => {
  const navigate = useRouter();

  return useMutation({
    mutationFn: UserApi.signinUser,
    onSuccess: (data) => {
      navigate.push("/");
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
