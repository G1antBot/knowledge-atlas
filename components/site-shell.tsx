"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { archiveProjects, navItems } from "@/data/content";
import { t } from "@/lib/i18n";
import { LocaleProvider, useLocale } from "@/components/locale-context";
import { ArchiveCommandLauncher } from "@/components/archive-command-launcher";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return <LocaleProvider><ShellContent>{children}</ShellContent></LocaleProvider>;
}

function ShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { locale, toggleLocale } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuLabel = locale === "zh" ? (menuOpen ? "关闭菜单" : "打开菜单") : (menuOpen ? "Close menu" : "Open menu");

  return <div className="site-root">
    <header className="site-header">
      <Link className="wordmark" href="/" onClick={() => setMenuOpen(false)} aria-label="Knowledge Atlas home">
        <span className="wordmark-symbol">KA</span><span>KNOWLEDGE<br /><b>ATLAS</b></span>
      </Link>
      <nav id="main-navigation" className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label={locale === "zh" ? "主导航" : "Main navigation"}>
        {navItems.map((item) => <Link key={item.href} href={item.href} className={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)) ? "active" : ""} onClick={() => setMenuOpen(false)} aria-current={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)) ? "page" : undefined}>{t(item.label, locale)}<span className="nav-index">{String(navItems.indexOf(item) + 1).padStart(2, "0")}</span></Link>)}
      </nav>
      <div className="header-actions">
          <ArchiveCommandLauncher projects={archiveProjects} />
        <button className="locale-switch" type="button" onClick={toggleLocale} aria-label={locale === "zh" ? "切换为英文" : "Switch to Chinese"}><span className={locale === "zh" ? "selected" : ""}>中</span><span>/</span><span className={locale === "en" ? "selected" : ""}>EN</span></button>
        <button className={`menu-toggle ${menuOpen ? "is-open" : ""}`} type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="main-navigation" aria-label={menuLabel}><span /><span /><span /><b>{locale === "zh" ? "菜单" : "Menu"}</b></button>
      </div>
    </header>
    <main>{children}</main>
    <footer className="site-footer"><div><span className="footer-signal" />{locale === "zh" ? "个人 AI 知识系统 / 前端原型" : "Personal AI knowledge system / front-end prototype"}</div><div className="footer-meta"><span>{locale === "zh" ? "档案状态：持续整理" : "Archive status: in progress"}</span><span>{new Date().getFullYear()}</span></div></footer>
  </div>;
}
