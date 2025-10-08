import { User } from "@/types/user.types";
import { BASE_API_URL } from ".";

const fetchCurrentUser = async (): Promise<User> => {
  const res = await fetch(new URL("/api/users/me", BASE_API_URL), {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch current user info");
  }

  return res.json();
};

const logout = async () => {
  const res = await fetch(new URL("/api/auth/logout", BASE_API_URL), {
    method: "post",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to logout");
  }

  return res.json();
};

export const UserApi = {
  fetchCurrentUser,
  logout,
};
