import Link from "next/link";

const sections = [
  {
    title: "画像や入力内容について",
    body: [
      "えから便りは、手元の画像を便箋やカードとして印刷しやすい形に整えるためのアプリです。",
      "画像や入力した文字は、原則としてお使いの端末・ブラウザ上で扱われます。大切な作品や個人情報を含む画像を使う場合は、ご自身で内容を確認したうえでご利用ください。",
    ],
  },
  {
    title: "印刷結果について",
    body: [
      "画面上の色や濃さと、実際に印刷した色は、プリンタ、用紙、インク、印刷設定によって変わります。",
      "大切なお手紙や販売用のカードに使う前には、必ず試し刷りをしてください。A4・実際のサイズ（100%）での印刷をおすすめします。",
    ],
  },
  {
    title: "作品・権利について",
    body: [
      "アップロードする絵や写真は、ご自身で利用できるものを使ってください。他の人の作品、写真、キャラクター、ロゴなどを使う場合は、必要な許可があるか確認してください。",
      "作成した便箋やカードの利用、配布、販売などに関して生じたトラブルについて、えから便りは責任を負いません。",
    ],
  },
  {
    title: "データの保存について",
    body: [
      "保存ボタンで作成されるPNG画像は、利用者自身の操作で端末に保存されます。",
      "ブラウザの更新、端末の設定、キャッシュ削除などにより、作業途中の状態が失われることがあります。必要な画像は早めに保存してください。",
    ],
  },
  {
    title: "免責事項",
    body: [
      "えから便りは、できるだけ気持ちよく使えるように作っていますが、すべての環境で同じ表示・印刷結果になることを保証するものではありません。",
      "本アプリの利用により発生した損害、印刷ミス、データ消失、権利上の問題、第三者とのトラブルについて、開発者は責任を負いません。",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="policy-page">
      <div className="policy-paper">
        <Link className="policy-back" href="/">← えから便りへ戻る</Link>
        <p className="eyebrow">Privacy & Notice</p>
        <h1>プライバシーポリシー・免責事項</h1>
        <p className="policy-lead">
          えから便りを安心して使っていただくために、画像の扱い、印刷結果、作品の権利についての考え方をまとめています。
        </p>
        <div className="policy-sections">
          {sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
        <p className="policy-date">制定日: 2026年6月19日</p>
      </div>
    </main>
  );
}
