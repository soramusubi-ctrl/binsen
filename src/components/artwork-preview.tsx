"use client";

import { useEffect, useRef } from "react";
import { EditorSettings, renderArtworkPreview } from "@/lib/canvas";

type ArtworkPreviewProps = {
  image: HTMLImageElement | null;
  settings: EditorSettings;
};

export function ArtworkPreview({ image, settings }: ArtworkPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) renderArtworkPreview(canvasRef.current, image, settings);
  }, [image, settings]);

  return (
    <div className="artwork-preview">
      <canvas ref={canvasRef} aria-label="選んだ絵のプレビュー" />
      {!image && <span>ここに描いた絵が入ります</span>}
    </div>
  );
}
