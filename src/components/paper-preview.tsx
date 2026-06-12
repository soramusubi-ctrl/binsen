"use client";

import { useEffect, useRef } from "react";
import { EditorSettings, renderA4, TemplateId } from "@/lib/canvas";

type PaperPreviewProps = {
  template: TemplateId;
  image: HTMLImageElement | null;
  settings: EditorSettings;
};

export function PaperPreview({ template, image, settings }: PaperPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) renderA4(canvasRef.current, template, image, settings, 0.32);
  }, [image, settings, template]);

  return (
    <div className="paper-stage">
      <div className="a4-callout">A4に4分割して印刷</div>
      <div className="paper-label">
        <span>A4</span>
        <strong>4枚できあがり</strong>
      </div>
      <canvas ref={canvasRef} className="sheet-canvas" aria-label="A4 4面付けの完成プレビュー" />
      <div className="cut-note"><span />点線にそって切ると、4枚になります</div>
    </div>
  );
}
