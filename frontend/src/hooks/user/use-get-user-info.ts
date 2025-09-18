import { UserApi } from "@/api/user";
import { useQuery } from "@tanstack/react-query";

export const useGetMyInfo = () => {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: UserApi.fetchCurrentUser,
  });
};
