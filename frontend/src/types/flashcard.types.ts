export type GetFlashCardsResponse = {
  groupingId: string;
  title: string;
  createdAt: string;
  flashCards: {
    id: number;
    groupingId: string;
    frontContent: string;
    backContent: string;
  }[];
}[];
