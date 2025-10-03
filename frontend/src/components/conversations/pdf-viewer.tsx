"use client";
import { Document as PdfDocument, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { type Document as DocumentT } from "@/types/document.types";
import { Button, ButtonGroup, IconButton } from "../ui/button";
import React, { useEffect, useRef, useState } from "react";
import { Crop, ZoomIn, ZoomOut } from "lucide-react";
import { Input } from "../ui/input";
import { Toggle } from "../ui/toggle";
import { cn } from "@/lib/utils";
import { useDocumentContext } from "@/context/DocumentContext";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewer({
  presignedUrl,
  document: pdfDocument,
}: {
  document: DocumentT;
  presignedUrl: string;
}) {
  const [scale, setScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageProxy, setCurrentPageProxy] = useState("1");
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [current, setCurrent] = useState({ x: 0, y: 0 });
  const pagesCanvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const [screenshotMode, setScreenshotMode] = useState<boolean>(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const { setSelectedImage, setChatQuery } = useDocumentContext();

  useEffect(() => {
    if (!pdfLoaded || !scrollContainerRef.current) return;

    let debounceTimer: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(debounceTimer);

      debounceTimer = setTimeout(() => {
        if (!scrollContainerRef.current) return;

        const container = scrollContainerRef.current;
        const scrollTop = container.scrollTop;
        const containerHeight = container.clientHeight;
        const scrollCenter = scrollTop + containerHeight / 2;

        let closestPage = 1;
        let closestDistance = Infinity;

        pageRefs.current.forEach((pageElement, pageNumber) => {
          if (pageElement) {
            const rect = pageElement.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            // Calculate page position relative to container
            const pageTop = rect.top - containerRect.top + scrollTop;
            const pageHeight = rect.height;
            const pageCenter = pageTop + pageHeight / 2;

            const distance = Math.abs(scrollCenter - pageCenter);

            if (distance < closestDistance) {
              closestDistance = distance;
              closestPage = pageNumber;
            }
          }
        });

        if (closestPage !== currentPage) {
          setCurrentPage(closestPage);
          setCurrentPageProxy(closestPage.toString());
        }
      }, 50);
    };

    const container = scrollContainerRef.current;
    container.addEventListener("scroll", handleScroll);

    // Initial calculation
    handleScroll();

    return () => {
      clearTimeout(debounceTimer);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [pdfLoaded, currentPage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSelecting(false);
        setSelectionRect(null);
        setCurrent({ x: 0, y: 0 });
        setStart({ x: 0, y: 0 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const scrollToPage = (pageNumber: number) => {
    const pageElement = pageRefs.current.get(pageNumber);
    if (pageElement && scrollContainerRef.current) {
      pageElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const overlayRect = overlayRef.current?.getBoundingClientRect();
    if (!overlayRect) return;
    setStart({
      x: e.clientX - overlayRect.left,
      y: e.clientY - overlayRect.top,
    });
    setCurrent({
      x: e.clientX - overlayRect.left,
      y: e.clientY - overlayRect.top,
    });
    setIsSelecting(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting) return;
    const overlayRect = overlayRef.current?.getBoundingClientRect();
    if (!overlayRect) return;
    setCurrent({
      x: e.clientX - overlayRect.left,
      y: e.clientY - overlayRect.top,
    });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsSelecting(false);

    const overlayRect = overlayRef.current?.getBoundingClientRect();
    if (!overlayRect) return;
    const endX = e.clientX - overlayRect.left;
    const endY = e.clientY - overlayRect.top;

    const selection = {
      x: Math.min(endX, start.x),
      y: Math.min(endY, start.y),
      width: Math.abs(endX - start.x),
      height: Math.abs(endY - start.y),
    };

    if (selection.width > 2 && selection.height > 2) {
      setSelectionRect(selection);
    } else {
      setSelectionRect(null);
      setScreenshotMode(false);
    }
  };

  const processSelection = (query: string) => {
    if (!selectionRect) return;

    const canvas = pagesCanvasRefs.current.get(currentPage);
    console.log(canvas);
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const imageData = ctx.getImageData(
        selectionRect.x,
        selectionRect.y,
        selectionRect.width,
        selectionRect.height,
      );

      // Create a new canvas to put the selection
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = selectionRect.width;
      tempCanvas.height = selectionRect.height;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;
      tempCtx.putImageData(imageData, 0, 0);
      tempCanvas.toBlob((blob) => {
        console.log(blob);
        if (blob) {
          setSelectedImage(blob);
          setChatQuery(query);
        }
      }, "image/png");
    }
    setSelectionRect(null);
    setScreenshotMode(false);
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="border-b-border bg-bg-base top-0 z-10 flex h-10 items-center gap-4 border-b px-5">
        <span className="flex items-center gap-1 text-xs font-medium">
          Page
          <Input
            value={currentPageProxy}
            className="w-10 rounded-sm px-2"
            size="28"
            onChange={(e) => {
              setCurrentPageProxy(e.target.value);
            }}
            onBlur={() => {
              if (
                currentPageProxy === "" ||
                parseInt(currentPageProxy) < 0 ||
                parseInt(currentPageProxy) > pdfDocument.pageCount
              )
                setCurrentPageProxy(currentPage.toString());
              else {
                setCurrentPage(parseInt(currentPageProxy));
                scrollToPage(parseInt(currentPageProxy));
              }
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
          <Toggle pressed={screenshotMode} onPressedChange={setScreenshotMode}>
            <Crop className="text-fg-secondary size-4" />
          </Toggle>
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        className="relative max-w-full flex-1 overflow-auto"
      >
        <PdfDocument
          file={presignedUrl}
          onLoadSuccess={() => {
            console.log("loaded");
            setPdfLoaded(true);
          }}
          onLoadError={() => console.log("error")}
          className="relative z-0"
        >
          {Array.from({ length: pdfDocument.pageCount }).map((_, i) => (
            <div
              key={i + 1}
              ref={(el) => {
                if (el) {
                  pageRefs.current.set(i + 1, el);
                }
              }}
              data-page={i + 1}
              className="mb-2"
            >
              <Page
                pageNumber={i + 1}
                scale={scale}
                onRenderSuccess={() => {
                  // Trigger observer setup after pages render
                  if (i === 0) {
                    // Only trigger on first page to avoid multiple calls
                    setTimeout(() => setPdfLoaded(true), 100);
                  }
                }}
                canvasRef={(canvas) => {
                  if (canvas) {
                    pagesCanvasRefs.current.set(i + 1, canvas);
                  } else {
                    pagesCanvasRefs.current.delete(i + 1);
                  }
                }}
              />
            </div>
          ))}
          <div
            ref={overlayRef}
            className={cn("absolute inset-0", {
              "pointer-events-none z-0": !screenshotMode,
              "pointer-events-auto z-20 cursor-crosshair": screenshotMode,
            })}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {isSelecting && (
              <div
                className="absolute border-2 border-blue-500 bg-blue-200/30"
                style={{
                  left: Math.min(start.x, current.x),
                  top: Math.min(start.y, current.y),
                  width: Math.abs(current.x - start.x),
                  height: Math.abs(current.y - start.y),
                }}
              />
            )}
            {selectionRect && (
              <>
                <div
                  className="absolute border-2 border-blue-500 bg-blue-200/30"
                  style={{
                    left: selectionRect.x,
                    top: selectionRect.y,
                    width: selectionRect.width,
                    height: selectionRect.height,
                    pointerEvents: "none",
                  }}
                />
                <div
                  className="absolute z-50 flex"
                  style={{ left: selectionRect.x, top: selectionRect.y - 40 }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                >
                  <ButtonGroup
                    color="neutral"
                    size="32"
                    className="hover:bg-fill1"
                  >
                    <Button onClick={() => processSelection("Explain")}>
                      Explain
                    </Button>
                    <Button onClick={() => processSelection("Summarize")}>
                      Summarize
                    </Button>
                  </ButtonGroup>
                </div>
              </>
            )}
          </div>
        </PdfDocument>
      </div>
    </div>
  );
}
