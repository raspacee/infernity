"use client";

import React, { useRef, useState } from "react";
import { IHighlight } from "react-pdf-highlighter";

interface DocumentContextType {
  selectedImage: Blob | null;
  setSelectedImage: (image: Blob | null) => void;
  chatInputRef: React.RefObject<HTMLTextAreaElement | null>;
  highlights: Array<IHighlight>;
  setHighlights: React.Dispatch<React.SetStateAction<IHighlight[]>>;
  scrollViewerTo: React.RefObject<(highlight: IHighlight) => void>;
  currentPage: string;
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
}

const DocumentContext = React.createContext<DocumentContextType | null>(null);

export const DocumentContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedImage, setSelectedImage] = useState<Blob | null>(null);
  const [highlights, setHighlights] = useState<Array<IHighlight>>([]);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const [currentPage, setCurrentPage] = useState("1");

  const scrollViewerTo = useRef((highlight: IHighlight) => {});

  return (
    <DocumentContext.Provider
      value={{
        selectedImage,
        setSelectedImage,
        chatInputRef,
        highlights,
        setHighlights,
        scrollViewerTo,
        currentPage,
        setCurrentPage,
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
