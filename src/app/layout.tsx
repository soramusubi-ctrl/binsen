import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "えから便り | 描いた絵を、使える便箋に。",
  description: "手書きの絵を、家庭用プリンタで使える便箋や一筆箋に整えるアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
