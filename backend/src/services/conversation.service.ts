import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { conversationsTable, documentsTable } from "../db/schema";
import { UpdateConversationFields } from "../validators/conversation.validator";
import { NotFoundError } from "../exceptions/not-found-error";

export class ConversationService {
  private getConversationOrThrow = async (
    id: string,
  ): Promise<typeof conversationsTable.$inferSelect> => {
    const [conversation] = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, id))
      .limit(1);
    if (!conversation) throw new NotFoundError("Conversation not found");
    return conversation;
  };

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
        eq(conversationsTable.id, documentsTable.conversationId),
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
    newConversation: typeof conversationsTable.$inferInsert,
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
    fields: UpdateConversationFields,
  ): Promise<typeof conversationsTable.$inferSelect> => {
    const [result] = await db
      .update(conversationsTable)
      .set(fields)
      .where(eq(conversationsTable.id, conversationId))
      .returning();

    if (!result) throw new NotFoundError("Conversation not found");

    return result;
  };

  public getConversationSources = async (conversationId: string) => {
    await this.getConversationOrThrow(conversationId);

    const sources = await db
      .select({
        id: documentsTable.id,
        originalFileName: documentsTable.originalFilename,
        isQueryable: documentsTable.isQueryable,
      })
      .from(documentsTable)
      .where(eq(documentsTable.conversationId, conversationId))
      .orderBy(desc(documentsTable.uploadedAt));

    return sources;
  };
}
