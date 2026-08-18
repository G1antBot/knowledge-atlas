import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Knowledge Atlas — Personal AI Knowledge System",
  description: "A source-aware personal AI knowledge system prototype for project records and questions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN" data-scroll-behavior="smooth"><body><SiteShell>{children}</SiteShell></body></html>;
}
