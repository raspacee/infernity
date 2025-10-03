import { eq, asc } from "drizzle-orm";
import { db } from "../db";
import { messagesTable, messagesRoleEnum } from "../db/schema";

export class MessageService {
  public async getMessages(
    conversationId: string
  ): Promise<(typeof messagesTable.$inferSelect)[]> {
    const messages = await db
      .select()
      .from(messagesTable)
      .orderBy(asc(messagesTable.id))
      .where(eq(messagesTable.conversationId, conversationId));
    return messages;
  }

  public async createMessage(
    newMessage: typeof messagesTable.$inferInsert
  ): Promise<typeof messagesTable.$inferSelect> {
    const [message] = await db
      .insert(messagesTable)
      .values({
        content: newMessage.content,
        conversationId: newMessage.conversationId,
        role: newMessage.role,
        queryImageKey: newMessage.queryImageKey,
        createdAt: newMessage.createdAt,
      })
      .returning();
    return message;
  }
}
