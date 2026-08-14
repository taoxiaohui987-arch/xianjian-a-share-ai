import type { Metadata } from "next";
import "./globals.css";
import "./data.css";
import "./quote.css";

export const metadata: Metadata = {
  title: "先见量化｜A股 AI 预测分析平台",
  description: "融合行情、技术面、资金面与事件情绪的 A 股量化预测分析平台。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "先见量化｜A股 AI 预测分析平台",
    description: "看见趋势，更看清风险。",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "先见量化 A股 AI 预测分析平台" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
