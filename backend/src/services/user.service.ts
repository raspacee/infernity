import { db } from "../db";
import { usersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { User } from "../types/user.types";

const getUserInfo = async (userId: string): Promise<User | null> => {
  const [user] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      avatarUrl: usersTable.avatarUrl,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  return user;
};

const UserService = { getUserInfo };

export { UserService };
