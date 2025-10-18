import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { conversationsTable, documentsTable } from "../db/schema";
import { UpdateConversationFields } from "../validators/conversation.validator";

export class ConversationService {
  public getUserConversations = async (userId: string) => {
    const conversations = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.userId, userId))
      .orderBy(desc(conversationsTable.createdAt));
    return conversations;
  };

  public getConversationWithDocument = async (conversationId: string) => {
    const [conversation] = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, conversationId))
      .innerJoin(
        documentsTable,
        eq(conversationsTable.id, documentsTable.conversationId)
      );

    if (!conversation) return null;

    return conversation;
  };

  public getConversationById = async (conversationId: string) => {
    const [conversation] = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, conversationId));

    if (!conversation) return null;

    return conversation;
  };

  public createConversation = async (
    newConversation: typeof conversationsTable.$inferInsert
  ) => {
    const [conversation] = await db
      .insert(conversationsTable)
      .values({
        ...newConversation,
      })
      .returning({ id: conversationsTable.id });
    return conversation;
  };

  public updateConversation = async (
    conversationId: string,
    fields: UpdateConversationFields
  ): Promise<typeof conversationsTable.$inferSelect> => {
    const [result] = await db
      .update(conversationsTable)
      .set(fields)
      .where(eq(conversationsTable.id, conversationId))
      .returning();
    return result;
  };
}
