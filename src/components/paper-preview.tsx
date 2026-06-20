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
  const isNote = template === "note";

  useEffect(() => {
    if (canvasRef.current) renderA4(canvasRef.current, template, image, settings, 0.32);
  }, [image, settings, template]);

  return (
    <div className="paper-stage">
      <div className="a4-callout">{isNote ? "A4に8分割して印刷" : "A4に4分割して印刷"}</div>
      <div className="paper-label">
        <span>A4</span>
        <strong>{isNote ? "一筆箋8枚できあがり" : "4枚できあがり"}</strong>
      </div>
      <canvas ref={canvasRef} className="sheet-canvas" aria-label={isNote ? "A4 8面付けの一筆箋プレビュー" : "A4 4面付けの完成プレビュー"} />
      <div className="cut-note"><span />{isNote ? "点線にそって切ると、一筆箋8枚になります" : "点線にそって切ると、4枚になります"}</div>
    </div>
  );
}
