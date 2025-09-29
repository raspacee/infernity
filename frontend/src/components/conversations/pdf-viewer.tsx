"use client";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { type Document as DocumentT } from "@/types/document.types";
import { Button, IconButton } from "../ui/button";
import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Input } from "../ui/input";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewer({
  presignedUrl,
  document,
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

  const scrollToPage = (pageNumber: number) => {
    const pageElement = pageRefs.current.get(pageNumber);
    if (pageElement && scrollContainerRef.current) {
      pageElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="border-b-border bg-bg-base sticky top-0 z-10 flex h-10 items-center gap-4 border-b px-5">
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
                parseInt(currentPageProxy) > document.pageCount
              )
                setCurrentPageProxy(currentPage.toString());
              else {
                setCurrentPage(parseInt(currentPageProxy));
                scrollToPage(parseInt(currentPageProxy));
              }
            }}
          />
          of {document.pageCount}
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
      <div ref={scrollContainerRef} className="max-w-full flex-1 overflow-auto">
        <Document
          file={presignedUrl}
          onLoadSuccess={() => {
            console.log("loaded");
            setPdfLoaded(true);
          }}
          onLoadError={() => console.log("error")}
        >
          {Array.from({ length: document.pageCount }).map((_, i) => (
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
              />
            </div>
          ))}
        </Document>
      </div>
    </div>
  );
}
