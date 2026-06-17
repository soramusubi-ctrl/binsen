"use client";

import { ChangeEvent, useRef, useState } from "react";
import NextImage from "next/image";
import {
  downloadCanvas,
  EditorSettings,
  FrameId,
  LineStyleId,
  renderA4,
  renderPiece,
  TemplateId,
} from "@/lib/canvas";
import { PaperPreview } from "@/components/paper-preview";
import { ArtworkPreview } from "@/components/artwork-preview";

const templates: Array<{ id: TemplateId; name: string; caption: string; mark: string }> = [
  { id: "watermark", name: "透かし便箋", caption: "絵をふんわり背景に", mark: "淡" },
  { id: "frame", name: "枠つき便箋", caption: "絵を上に、やさしい枠", mark: "枠" },
  { id: "scatter", name: "ちりばめ便箋", caption: "余白を残して軽やかに", mark: "散" },
  { id: "card", name: "メッセージカード", caption: "短い言葉を添えて", mark: "札" },
];

const adjustmentTools = [
  { id: "crop", label: "切り抜き", image: "/assets/tool-crop.png" },
  { id: "light", label: "明るさ", image: "/assets/tool-light.png" },
  { id: "background", label: "背景", image: "/assets/tool-background.png" },
  { id: "adjust", label: "調整", image: "/assets/tool-adjust.png" },
] as const;

const frames: Array<{ id: FrameId; name: string }> = [
  { id: "leaves", name: "若葉" },
  { id: "flowers", name: "小花" },
  { id: "mimosa", name: "ミモザ" },
  { id: "lavender", name: "ラベンダー" },
  { id: "berries", name: "木の実" },
  { id: "ribbon", name: "リボン" },
  { id: "dots", name: "水彩ドット" },
  { id: "double", name: "二重線" },
  { id: "corner", name: "角花" },
  { id: "stars", name: "星空" },
];

const lineStyles: Array<{ id: LineStyleId; name: string }> = [
  { id: "solid", name: "標準線" },
  { id: "dashed", name: "点線" },
  { id: "double", name: "二重線" },
  { id: "handdrawn", name: "手描き風" },
  { id: "dots", name: "ドット" },
];

const initialSettings: EditorSettings = {
  brightness: 105,
  cleanup: 18,
  rotation: 0,
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  showLines: true,
  lineStyle: "solid",
  watermarkOpacity: 32,
  message: "",
  frame: "leaves",
};

function LeafMark() {
  return (
    <svg viewBox="0 0 52 58" aria-hidden="true">
      <path d="M26 55C25 35 27 20 40 4" />
      <path d="M28 35C17 35 10 28 9 18c12-2 20 4 19 17Z" />
      <path d="M32 23C32 12 39 6 49 5c1 11-5 18-17 18Z" />
    </svg>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="range-field">
      <span>{label}<b>{Math.round(value * 100) / 100}</b></span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export function LetterMaker() {
  const [template, setTemplate] = useState<TemplateId>("frame");
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageName, setImageName] = useState("");
  const [settings, setSettings] = useState(initialSettings);
  const [showAdjustments, setShowAdjustments] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const updateSetting = <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const nextImage = new Image();
    nextImage.onload = () => {
      setImage(nextImage);
      setImageName(file.name);
      URL.revokeObjectURL(url);
    };
    nextImage.src = url;
  };

  const saveA4 = () => {
    const canvas = document.createElement("canvas");
    renderA4(canvas, template, image, settings);
    downloadCanvas(canvas, "えから便り_A4_4枚.png");
  };

  const saveOne = () => {
    const canvas = document.createElement("canvas");
    renderPiece(canvas, template, image, settings);
    downloadCanvas(canvas, "えから便り_1枚.png");
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#" aria-label="えから便り ホーム">
          <LeafMark />
          <span><strong>えから便り</strong><small>描いた絵を、使える便箋に。</small></span>
        </a>
        <div className="header-note">画像は外部に送信されません</div>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">おうちプリンタで、すぐ使える</p>
          <h1>手書きのやさしさを、<br /><em>あなたの言葉</em>にのせて。</h1>
          <p>絵を選んで、好きな形を選ぶだけ。<br />A4用紙から、小さな便箋が4枚できあがります。</p>
        </div>
        <div className="steps" aria-label="使い方">
          <span className="active"><b>1</b>絵を選ぶ</span><i />
          <span><b>2</b>かたちを選ぶ</span><i />
          <span><b>3</b>保存する</span>
        </div>
      </section>

      <div className="workspace">
        <aside className="controls">
          <section className="control-card upload-card">
            <div className="section-heading"><span>1</span><div><h2>絵を選ぶ</h2><p>写真でもスキャンでも大丈夫</p></div></div>
            <input
              ref={fileRef}
              className="visually-hidden"
              type="file"
              accept="image/jpeg,image/png"
              capture="environment"
              onChange={handleImage}
            />
            <ArtworkPreview image={image} settings={settings} onSelect={() => fileRef.current?.click()} />
            {image && (
              <button className="upload-button" onClick={() => fileRef.current?.click()}>
                <span className="upload-icon">＋</span>
                <strong>別の絵を選ぶ</strong>
                <small>{imageName}</small>
              </button>
            )}
            {image && (
              <div className="adjust-tool-grid">
                {adjustmentTools.map((tool) => (
                  <button
                    key={tool.id}
                    className={showAdjustments ? "active" : ""}
                    onClick={() => setShowAdjustments(true)}
                  >
                    <NextImage src={tool.image} alt="" width={64} height={64} />
                    <span>{tool.label}</span>
                  </button>
                ))}
              </div>
            )}
            {image && showAdjustments && (
              <div className="adjustments">
                <button className="close-adjustments" onClick={() => setShowAdjustments(false)}>調整を閉じる ×</button>
                <RangeField label="明るさ" value={settings.brightness} min={70} max={140} onChange={(v) => updateSetting("brightness", v)} />
                <RangeField label="紙の白さ補正" value={settings.cleanup} min={0} max={100} onChange={(v) => updateSetting("cleanup", v)} />
                <RangeField label="拡大・余白除去" value={settings.zoom} min={1} max={2.2} step={0.05} onChange={(v) => updateSetting("zoom", v)} />
                <RangeField label="左右位置" value={settings.offsetX} min={-1} max={1} step={0.05} onChange={(v) => updateSetting("offsetX", v)} />
                <RangeField label="上下位置" value={settings.offsetY} min={-1} max={1} step={0.05} onChange={(v) => updateSetting("offsetY", v)} />
                <div className="rotation-row">
                  <span>向き</span>
                  {[0, 90, 180, 270].map((degree) => (
                    <button key={degree} className={settings.rotation === degree ? "selected" : ""} onClick={() => updateSetting("rotation", degree)}>
                      {degree}°
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="control-card">
            <div className="section-heading template-heading"><span>2</span><div><h2>テンプレートを選ぶ</h2><p>絵に合う便箋を選びましょう</p></div><small>4種類</small></div>
            <div className="template-grid">
              {templates.map((item) => (
                <button
                  key={item.id}
                  className={template === item.id ? "template selected" : "template"}
                  onClick={() => setTemplate(item.id)}
                  aria-pressed={template === item.id}
                >
                  <span className={`template-art ${item.id}`}><b>{item.mark}</b></span>
                  <strong>{item.name}</strong>
                  <small>{item.caption}</small>
                </button>
              ))}
            </div>
            {template === "watermark" && (
              <div className="watermark-density">
                <RangeField
                  label="透かしの濃さ"
                  value={settings.watermarkOpacity}
                  min={18}
                  max={70}
                  onChange={(v) => updateSetting("watermarkOpacity", v)}
                />
                <p>印刷で薄いときは右へ。文字を書きたいときは濃くしすぎないのがおすすめです。</p>
              </div>
            )}
            {template === "frame" && (
              <div className="frame-picker">
                <div className="frame-picker-heading">
                  <strong>フレーム柄を選ぶ</strong>
                  <small>10種類</small>
                </div>
                <div className="frame-grid">
                  {frames.map((frame) => (
                    <button
                      key={frame.id}
                      className={settings.frame === frame.id ? `frame-choice ${frame.id} selected` : `frame-choice ${frame.id}`}
                      onClick={() => updateSetting("frame", frame.id)}
                      aria-pressed={settings.frame === frame.id}
                    >
                      <span><i /><i /><i /></span>
                      <b>{frame.name}</b>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <label className="switch-row">
              <span><strong>罫線を入れる</strong><small>手書きしやすい薄い線</small></span>
              <input type="checkbox" checked={settings.showLines} onChange={(e) => updateSetting("showLines", e.target.checked)} />
            </label>
            {settings.showLines && (
              <div className="line-picker">
                {lineStyles.map((line) => (
                  <button
                    key={line.id}
                    className={settings.lineStyle === line.id ? `line-choice ${line.id} selected` : `line-choice ${line.id}`}
                    onClick={() => updateSetting("lineStyle", line.id)}
                    aria-pressed={settings.lineStyle === line.id}
                  >
                    <span><i /></span>
                    <b>{line.name}</b>
                  </button>
                ))}
              </div>
            )}
            <label className="message-field">
              <span><strong>文字を入れる</strong> <small>なくてもOK</small></span>
              <textarea
                rows={2}
                value={settings.message}
                maxLength={80}
                placeholder="例：いつもありがとう"
                onChange={(e) => updateSetting("message", e.target.value)}
              />
            </label>
          </section>
        </aside>

        <section className="preview-area">
          <div className="preview-heading">
            <div><span className="leaf-dot">⌁</span><h2>できあがり</h2></div>
            <p>A4縦・4面付け</p>
          </div>
          <PaperPreview template={template} image={image} settings={settings} />
          <div className="save-panel">
            <div><span>3</span><p><strong>おうちのプリンタで印刷</strong><small>A4・実際のサイズ（100%）がおすすめです</small></p></div>
            <button className="primary-button" onClick={saveA4}><span>↓</span> 印刷用A4を保存</button>
            <button className="secondary-button" onClick={saveOne}>1枚だけ保存</button>
          </div>
        </section>
      </div>

      <footer>
        <NextImage className="footer-flower footer-flower-left" src="/assets/footer-left.png" alt="" width={320} height={180} />
        <p><strong>えから便り</strong> 手書きの絵を、日々の便りに。</p>
        <NextImage className="footer-flower footer-flower-right" src="/assets/footer-right.png" alt="" width={320} height={180} />
      </footer>
    </main>
  );
}
