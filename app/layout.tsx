import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000",
  ),
  title: "UC 산학협력단 통합 성과관리",
  description: "조직·사업·재정·성과를 한눈에 보는 산학협력단 통합 IR 대시보드",
  openGraph: {
    title: "UC 산학협력단 통합 성과관리 대시보드",
    description: "예산·성과·위험을 한눈에",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "UC 산학협력단 통합 성과관리 대시보드",
    description: "예산·성과·위험을 한눈에",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
