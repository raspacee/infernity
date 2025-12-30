import { db } from "../db";
import {
  flashCardsGroupTable,
  flashCardsTable,
  usersTable,
} from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { User } from "../types/user.types";
import { FlashCardsType } from "../jobs/workers/flashcards-worker";
import { v4 as uuid } from "uuid";

const createFlashCards = async (
  flashCards: FlashCardsType,
  title: string,
  conversationId: string
) => {
  const groupingId = uuid();
  const flashCardsGroup = await db.insert(flashCardsGroupTable).values({
    id: groupingId,
    conversationId,
    title,
    createdAt: new Date().toISOString(),
  });

  await db
    .insert(flashCardsTable)
    .values(flashCards.flashcards.map((f) => ({ ...f, groupingId })));

  return flashCardsGroup;
};

const getFlashCardsByConversationId = async (conversationId: string) => {
  const flashCardsGroups = await db
    .select()
    .from(flashCardsGroupTable)
    .where(eq(flashCardsGroupTable.conversationId, conversationId))
    .orderBy(desc(flashCardsGroupTable.createdAt));

  const flashCards = [];

  for (const group of flashCardsGroups) {
    const fc = await db
      .select()
      .from(flashCardsTable)
      .where(eq(flashCardsTable.groupingId, group.id));
    flashCards.push({
      groupingId: group.id,
      title: group.title,
      createdAt: group.createdAt,
      flashCards: fc,
    });
  }

  return flashCards;
};

const FlashCardsService = { createFlashCards, getFlashCardsByConversationId };

export { FlashCardsService };
