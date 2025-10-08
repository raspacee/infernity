import React, { useRef, useState } from "react";

interface DocumentContextType {
  selectedImage: Blob | null;
  setSelectedImage: (image: Blob | null) => void;
  chatInputRef: React.RefObject<HTMLTextAreaElement | null>;
}

const DocumentContext = React.createContext<DocumentContextType | null>(null);

export const DocumentContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedImage, setSelectedImage] = useState<Blob | null>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  return (
    <DocumentContext.Provider
      value={{
        selectedImage,
        setSelectedImage,
        chatInputRef,
      }}
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
