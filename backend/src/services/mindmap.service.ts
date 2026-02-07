import { db } from "../db";
import { mindMapTable } from "../db/schema";
import { desc, eq } from "drizzle-orm";
import { MindMapType } from "../jobs/workers/mindmap-worker";

const createMindMap = async (mindMap: MindMapType, conversationId: string) => {
  await db.insert(mindMapTable).values({
    chartCode: mindMap.chartCode,
    createdAt: new Date().toISOString(),
    conversationId,
  });
};

const getMindMapByConversationId = async (conversationId: string) => {
  const [mindMap] = await db
    .select()
    .from(mindMapTable)
    .where(eq(mindMapTable.conversationId, conversationId))
    .orderBy(desc(mindMapTable.createdAt))
    .limit(1);

  if (!mindMap) return null;

  return mindMap;
};

const MindMapService = { createMindMap, getMindMapByConversationId };

export { MindMapService };
