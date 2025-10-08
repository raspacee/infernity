import { UserApi } from "@/api/user";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: UserApi.logout,
    onSuccess: () => {
      router.push("/signin");
    },
    onError: (error) => {
      console.error("Failed to logout:", error);
    },
  });
};
