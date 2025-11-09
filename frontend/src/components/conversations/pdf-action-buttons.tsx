"use client";

import { useEffect } from "react";
import { Button, ButtonGroup } from "../ui/button";
import { ScaledPosition } from "react-pdf-highlighter";
import { useDocumentContext } from "@/context/DocumentContext";

type Props = {
  onUpdate?: () => void;
  content: {
    text?: string | undefined;
    image?: string | undefined;
  };

  position: ScaledPosition;
  hideTipAndSelection: () => void;
};

const base64ToBlob = (base64: string, mimeType = "image/png"): Blob => {
  const byteChars = atob(base64.split(",")[1]);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

export default function PdfActionButtons({
  content,
  position,
  hideTipAndSelection,
  onUpdate,
}: Props) {
  const { chatInputRef, setSelectedImage } = useDocumentContext();

  useEffect(() => {
    if (onUpdate) {
      onUpdate();
    }
  }, [onUpdate]);

  const handleAction = (action: "Explain" | "Summarize") => {
    console.log(position);
    if (chatInputRef.current && content.text) {
      chatInputRef.current.value = `${action}: ${content.text}`;
    } else if (chatInputRef.current && content.image) {
      setSelectedImage(base64ToBlob(content.image));
      chatInputRef.current.value = `${action} the image`;
    }
    hideTipAndSelection();
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection) selection.removeAllRanges();
    }
  };

  return (
    <div className="z-50 flex">
      <ButtonGroup
        color="neutral"
        size="32"
        className="hover:bg-fill1 shadow-md"
      >
        <Button onClick={() => handleAction("Explain")}>Explain</Button>
        <Button onClick={() => handleAction("Summarize")}>Summarize</Button>
      </ButtonGroup>
    </div>
  );
}
