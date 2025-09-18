import { UserApi } from "@/api/user";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useGetMyInfo = () => {
  return useSuspenseQuery({
    queryKey: ["user", "me"],
    queryFn: UserApi.fetchCurrentUser,
  });
};
