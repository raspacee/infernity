import { BASE_API_URL } from ".";
import { Document as DocumentT } from "@/types/document.types";

const uploadPdf = async (file: File) => {
  const formData = new FormData();

  formData.append("document", file);

  const res = await fetch(new URL("/api/documents", BASE_API_URL), {
    method: "post",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to upload document");

  return res.json();
};

const addDocument = async ({
  file,
  conversationId,
}: {
  file: File;
  conversationId: string;
}) => {
  const formData = new FormData();

  formData.append("document", file);

  const res = await fetch(
    new URL(`/api/conversations/${conversationId}/add-document`, BASE_API_URL),
    {
      method: "post",
      body: formData,
      credentials: "include",
    },
  );

  if (!res.ok) throw new Error("Failed to add document");

  return res.json();
};

const getPresignedUrl = async (
  conversationId: string,
): Promise<{ presignedUrl: string }> => {
  const res = await fetch(
    new URL(`/api/documents/presigned-url/${conversationId}`, BASE_API_URL),
    {
      method: "get",
      credentials: "include",
    },
  );

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error);
  }

  return res.json();
};

const toggleDocumentQueryable = async ({
  conversationId,
  documentId,
}: {
  conversationId: string;
  documentId: string;
}) => {
  const res = await fetch(
    new URL(
      `/api/documents/queryable/${conversationId}/${documentId}`,
      BASE_API_URL,
    ),
    {
      method: "post",
      credentials: "include",
    },
  );

  if (!res.ok) throw new Error("Failed to toggle document queryable");

  return res.json();
};

const getDocuments = async (
  conversationId: string,
): Promise<{
  presignedUrls: { presignedUrl: string; document: DocumentT }[];
}> => {
  const res = await fetch(
    new URL(`/api/documents/documents/${conversationId}`, BASE_API_URL),
    {
      method: "get",
      credentials: "include",
    },
  );

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error);
  }

  return res.json();
};

export const DocumentApi = {
  uploadPdf,
  getPresignedUrl,
  addDocument,
  toggleDocumentQueryable,
  getDocuments,
};
