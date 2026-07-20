type SpinnerProps = {
  label?: string;
};

export function Spinner({ label = "Carregando" }: SpinnerProps) {
  return (
    <div className="flex items-center gap-3 text-sm text-[var(--muted)]" role="status">
      <div
        className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[var(--accent)]"
        aria-hidden
      />
      <span>{label}</span>
    </div>
  );
}
