import { BASE_API_URL } from ".";

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

const getPresignedUrl = async (
  conversationId: string
): Promise<{ presignedUrl: string }> => {
  const res = await fetch(
    new URL(`/api/documents/presigned-url/${conversationId}`, BASE_API_URL),
    {
      method: "get",
      credentials: "include",
    }
  );

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error);
  }

  return res.json();
};

export const DocumentApi = { uploadPdf, getPresignedUrl };
