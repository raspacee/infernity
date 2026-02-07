import { User } from "@/types/user.types";
import { BASE_API_URL } from ".";
import { SigninSchemaType, SignupSchemaType } from "@/lib/schemas";

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

const signupUser = async (data: SignupSchemaType) => {
  const response = await fetch(new URL("/api/auth/signup", BASE_API_URL), {
    method: "post",
    body: JSON.stringify(data),
    credentials: "include",
    headers: {
      "content-type": "application/json",
    },
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message);
  }
  return response.json();
};

const verifyRequest = async (verificationCode: string) => {
  const response = await fetch(
    new URL("/api/auth/verify-signup", BASE_API_URL),
    {
      method: "post",
      body: JSON.stringify({ verificationCode }),
      headers: {
        "content-type": "application/json",
      },
    },
  );
  if (!response.ok) {
    if (response.status == 401) {
      throw new Error("Verification Link Expired");
    }
  }
  return response.json();
};

const signinUser = async (data: SigninSchemaType) => {
  const response = await fetch(new URL("/api/auth/signin", BASE_API_URL), {
    method: "post",
    body: JSON.stringify(data),
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message);
  }
  return response.json();
};

export const UserApi = {
  fetchCurrentUser,
  signupUser,
  verifyRequest,
  logout,
  signinUser,
};
