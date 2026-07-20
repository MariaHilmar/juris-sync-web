import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  title?: string;
  description?: string;
};

export function PageContainer({
  children,
  title,
  description,
}: PageContainerProps) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {(title || description) && (
        <header className="mb-8">
          {title && (
            <h1 className="text-3xl font-semibold text-[var(--foreground)]">
              {title}
            </h1>
          )}
          {description && (
            <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
              {description}
            </p>
          )}
        </header>
      )}
      {children}
    </main>
  );
}
