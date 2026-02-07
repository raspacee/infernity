"use client";

import { useEffect, useRef } from "react";
import mermaid from "mermaid";
import svgPanZoom from "svg-pan-zoom";

interface MermaidDiagramProps {
  chart: string;
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panZoomRef = useRef<SvgPanZoom.Instance | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
    });

    if (!containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = "";

    const renderId = `mermaid-${Math.random().toString(36).slice(2)}`;

    mermaid.render(renderId, chart).then(({ svg }) => {
      if (!containerRef.current) return;

      containerRef.current.innerHTML = svg;

      const svgElement = containerRef.current.querySelector("svg");
      if (!svgElement) return;

      svgElement.setAttribute("width", "100%");
      svgElement.setAttribute("height", "100%");
      svgElement.style.width = "100%";
      svgElement.style.height = "100%";

      // Destroy previous pan-zoom instance
      panZoomRef.current?.destroy();

      // Enable zoom & pan
      panZoomRef.current = svgPanZoom(svgElement, {
        zoomEnabled: true,
        panEnabled: true,
        controlIconsEnabled: true,
        fit: true,
        center: true,
        minZoom: 0.3,
        maxZoom: 10,
        mouseWheelZoomEnabled: true,
        dblClickZoomEnabled: true,
      });
    });

    return () => {
      panZoomRef.current?.destroy();
      panZoomRef.current = null;
    };
  }, [chart]);

  return (
    <div
      ref={containerRef}
      className="border-border h-full w-full overflow-hidden rounded-md border"
    />
  );
}
