export type Document = {
  id: string; // uuid
  userId: string; // uuid (foreign key)
  textContent: string;
  processingStatus: "pending" | "processing" | "completed" | "failed"; // your enum values here
  filename: string; // varchar(255)
  originalFileName: string; // varchar(255)
  fileSize: string; // bigint
  mimetype: string; // varchar(50)
  pageCount: number; // integer (nullable)
  bucketName: string; // varchar(50)
  s3Key: string; // varchar(512)
  s3Url: string; // varchar(1000)
  uploadedAt: string | null; // timestamp with timezone, stored as string, nullable
  isQueryable: boolean;
};

export type SourceItem = Pick<
  Document,
  "id" | "originalFileName" | "isQueryable"
>;
export type GetSourcesResultType = { data: SourceItem[] };
