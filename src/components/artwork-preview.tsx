"use client";

import { useEffect, useRef } from "react";
import { EditorSettings, renderArtworkPreview } from "@/lib/canvas";

type ArtworkPreviewProps = {
  image: HTMLImageElement | null;
  settings: EditorSettings;
  onSelect: () => void;
};

export function ArtworkPreview({ image, settings, onSelect }: ArtworkPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (image && canvasRef.current) renderArtworkPreview(canvasRef.current, image, settings);
  }, [image, settings]);

  if (!image) {
    return (
      <button className="empty-artwork-upload" onClick={onSelect}>
        <span className="camera-mark" aria-hidden="true"><i /></span>
        <strong>ここをタップして絵を選ぶ</strong>
        <span>カメラで撮影 または 写真から選択</span>
        <small>JPG / PNG</small>
      </button>
    );
  }

  return (
    <div className="artwork-preview">
      <canvas ref={canvasRef} aria-label="選んだ絵のプレビュー" />
    </div>
  );
}
