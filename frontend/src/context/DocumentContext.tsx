import React, { useState } from "react";

interface DocumentContextType {
  selectedImage: Blob | null;
  setSelectedImage: (image: Blob | null) => void;
  chatQuery: string;
  setChatQuery: (query: string) => void;
}

const DocumentContext = React.createContext<DocumentContextType | null>(null);

export const DocumentContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedImage, setSelectedImage] = useState<Blob | null>(null);
  const [chatQuery, setChatQuery] = useState<string>("");

  return (
    <DocumentContext.Provider
      value={{ selectedImage, setSelectedImage, chatQuery, setChatQuery }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocumentContext = () => {
  const context = React.useContext(DocumentContext);
  if (!context)
    throw new Error(
      "useDocumentContext must be used inside DocumentContextProvider",
    );
  return context;
};
