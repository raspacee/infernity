"use client";
import {
  PdfHighlighter,
  PdfLoader,
  IHighlight,
  NewHighlight,
  AreaHighlight,
  ScaledPosition,
  Content,
  Popup,
  Highlight,
} from "react-pdf-highlighter";
import { type Document as DocumentT } from "@/types/document.types";
import { Button, IconButton } from "../ui/button";
import React, { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { useCallback } from "react";

import "react-pdf-highlighter/dist/style.css";
import PdfActionButtons from "./pdf-action-buttons";
import { useDocumentContext } from "@/context/DocumentContext";

const parseIdFromHash = () =>
  document.location.hash.slice("#highlight-".length);

const resetHash = () => {
  document.location.hash = "";
};

const HighlightPopup = ({
  comment,
}: {
  comment: { text: string; emoji: string };
}) =>
  comment.text ? (
    <div className="Highlight__popup">
      {comment.emoji} {comment.text}
    </div>
  ) : null;

export default function PdfViewer({
  presignedUrl,
  document: pdfDocument,
}: {
  document: DocumentT;
  presignedUrl: string;
}) {
  const [scale, setScale] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { highlights, setHighlights, currentPage, setCurrentPage } =
    useDocumentContext();

  const scrollViewerTo = useRef<(highlight: IHighlight) => void | null>(null);

  const scrollToHighlightFromHash = useCallback(() => {
    if (highlights && scrollViewerTo.current) {
      const highlight = getHighlightById(parseIdFromHash());
      if (highlight) scrollViewerTo.current(highlight);
    }
  }, [highlights, scrollViewerTo.current]);

  useEffect(() => {
    window.addEventListener("hashchange", scrollToHighlightFromHash, false);
    return () => {
      window.removeEventListener(
        "hashchange",
        scrollToHighlightFromHash,
        false,
      );
    };
  }, [scrollToHighlightFromHash]);

  const getHighlightById = (id: string) => {
    return highlights.find((highlight) => highlight.id === id);
  };

  const updateHighlight = (
    highlightId: string,
    position: Partial<ScaledPosition>,
    content: Partial<Content>,
  ) => {
    setHighlights((prevHighlights) =>
      prevHighlights.map((h) => {
        const {
          id,
          position: originalPosition,
          content: originalContent,
          ...rest
        } = h;
        return id === highlightId
          ? {
              id,
              position: { ...originalPosition, ...position },
              content: { ...originalContent, ...content },
              ...rest,
            }
          : h;
      }),
    );
  };

  React.useEffect(() => {
    const pageNum = parseInt(currentPage);
    if (!scrollContainerRef.current || isNaN(pageNum)) return;

    const target = scrollContainerRef.current.querySelector(
      `[data-page-number="${pageNum}"]`,
    ) as HTMLElement | null;

    console.log(target);

    if (!target) return;

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [currentPage]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="border-b-border bg-bg-base top-0 z-10 flex h-10 items-center gap-4 border-b px-5">
        <span className="flex items-center gap-1 text-xs font-medium">
          Page
          <Input
            value={currentPage}
            className="w-10 rounded-sm px-2"
            size="28"
            onChange={(e) => {
              setCurrentPage(e.target.value);
            }}
            onBlur={() => {
              if (parseInt(currentPage) < 0) setCurrentPage("0");
              else if (parseInt(currentPage) > pdfDocument.pageCount)
                setCurrentPage(`${pdfDocument.pageCount}`);
            }}
          />
          of {pdfDocument.pageCount}
        </span>
        <div className="flex items-center gap-1">
          <Button
            size="28"
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
            color="neutral"
            variant="ghost"
          >
            <ZoomOut size={20} />
          </Button>
          <span className="text-xs font-medium">
            Zoom: {(scale * 100).toFixed(0)}%
          </span>
          <IconButton
            size="28"
            onClick={() => setScale((s) => Math.min(1.5, s + 0.1))}
            color="neutral"
            variant="ghost"
          >
            <ZoomIn size={20} />
          </IconButton>
        </div>
      </div>
      <div ref={scrollContainerRef} className="relative flex-1 overflow-auto">
        <PdfLoader url={presignedUrl} beforeLoad={<Spinner />}>
          {(pdfDocument) => (
            <PdfHighlighter
              key={`${scale}`}
              pdfDocument={pdfDocument}
              pdfScaleValue={scale.toString()}
              enableAreaSelection={(event) => event.altKey}
              onScrollChange={resetHash}
              scrollRef={(scrollTo) => {
                console.log("scrollRef assigned");
                scrollViewerTo.current = scrollTo;
                scrollToHighlightFromHash();
              }}
              onSelectionFinished={(
                position,
                content,
                hideTipAndSelection,
                transformSelection,
              ) => (
                <PdfActionButtons
                  position={position}
                  content={content}
                  hideTipAndSelection={hideTipAndSelection}
                />
              )}
              highlightTransform={(
                highlight,
                index,
                setTip,
                hideTip,
                viewportToScaled,
                screenshot,
                isScrolledTo,
              ) => {
                const isTextHighlight = !highlight.content?.image;

                const component = isTextHighlight ? (
                  <Highlight
                    isScrolledTo={isScrolledTo}
                    position={highlight.position}
                    comment={highlight.comment}
                  />
                ) : (
                  <AreaHighlight
                    isScrolledTo={isScrolledTo}
                    highlight={highlight}
                    onChange={(boundingRect) => {
                      updateHighlight(
                        highlight.id,
                        { boundingRect: viewportToScaled(boundingRect) },
                        { image: screenshot(boundingRect) },
                      );
                    }}
                  />
                );

                return (
                  <Popup
                    popupContent={<HighlightPopup {...highlight} />}
                    onMouseOver={(popupContent) =>
                      setTip(highlight, (highlight) => popupContent)
                    }
                    onMouseOut={hideTip}
                    key={index}
                  >
                    {component}
                  </Popup>
                );
              }}
              highlights={highlights}
            />
          )}
        </PdfLoader>
      </div>
    </div>
  );
}
