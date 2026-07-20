"use client";

import type { LucideIcon } from "lucide-react";
import { BarChart3, FileStack, Scale } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Visão Geral",
    icon: BarChart3,
    isActive: (pathname) => pathname === "/",
  },
  {
    href: "/processos",
    label: "Processos",
    icon: FileStack,
    isActive: (pathname) => pathname.startsWith("/processos"),
  },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/95 shadow-sm backdrop-blur">
      <div className="h-1 bg-[var(--foreground)]" />

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--foreground)] text-white shadow-sm transition group-hover:bg-[var(--accent)]">
            <Scale className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
            JurisSync
          </span>
        </Link>

        <p className="hidden text-xs text-[var(--muted)] sm:block">
          Portfólio Maria Hilmar Gomes
        </p>
      </div>

      <nav
        aria-label="Navegação principal"
        className="border-t border-[var(--border)] bg-[#fbfaf7]"
      >
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 sm:px-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.isActive(pathname);

            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className={`relative flex shrink-0 items-center gap-2 px-3 py-3 text-sm font-medium transition-colors sm:px-4 ${
                  active
                    ? "text-[var(--accent)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
                {active && (
                  <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[var(--accent)]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
