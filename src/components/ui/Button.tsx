import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

const variants = {
  primary:
    "bg-[var(--accent)] text-white hover:bg-[#185a3f] disabled:opacity-60",
  secondary:
    "border border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-slate-50 disabled:opacity-60",
};

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
