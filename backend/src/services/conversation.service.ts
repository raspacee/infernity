import { eq } from "drizzle-orm";
import { db } from "../db";
import { conversationsTable, documentsTable } from "../db/schema";

export class ConversationService {
  public getUserConversations = async (userId: string) => {
    const conversations = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.userId, userId));
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
}
