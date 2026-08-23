import "./globals.css";
import { SiteShell } from "@/components/site-shell";
import { rootMetadata } from "@/lib/metadata";

export const metadata = rootMetadata;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant" data-scroll-behavior="smooth"><body><SiteShell>{children}</SiteShell></body></html>;
}
