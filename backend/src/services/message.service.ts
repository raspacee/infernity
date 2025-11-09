import { eq, asc, desc, getTableColumns, sql } from "drizzle-orm";
import { db } from "../db";
import {
  messagesTable,
  messagesRoleEnum,
  chunkBoxPositionToMessageMappingTable,
  chunkBoxPositionTable,
  documentChunksTable,
} from "../db/schema";

export class MessageService {
  public async getMessages(
    conversationId: string
  ): Promise<(typeof messagesTable.$inferSelect)[]> {
    const messages = await db
      .select()
      .from(messagesTable)
      .orderBy(asc(messagesTable.id))
      .where(eq(messagesTable.conversationId, conversationId));

    const messagesWithAnnotations = await Promise.all(
      messages.map(async (message) => {
        const annotations = await db
          .select({
            chunkId: chunkBoxPositionTable.chunkId,
            annotations: sql`
      json_agg(
        to_jsonb(${chunkBoxPositionTable})
      ) FILTER (WHERE ${chunkBoxPositionTable.id} IS NOT NULL)
    `,
          })
          .from(chunkBoxPositionToMessageMappingTable)
          .innerJoin(
            chunkBoxPositionTable,
            eq(
              chunkBoxPositionToMessageMappingTable.chunkBoxPositionId,
              chunkBoxPositionTable.id
            )
          )
          .where(
            eq(chunkBoxPositionToMessageMappingTable.messageId, message.id)
          )
          .groupBy(chunkBoxPositionTable.chunkId);

        return {
          ...message,
          annotations,
        };
      })
    );
    return messagesWithAnnotations;
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

  public async getLastMessages(
    conversationId: string,
    count: number = 10
  ): Promise<(typeof messagesTable.$inferSelect)[]> {
    const messages = await db
      .select()
      .from(messagesTable)
      .orderBy(desc(messagesTable.id))
      .where(eq(messagesTable.conversationId, conversationId))
      .limit(count);
    return messages.reverse();
  }
}
