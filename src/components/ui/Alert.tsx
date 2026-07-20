import type { HTMLAttributes } from "react";

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "error" | "info" | "success";
};

const variants = {
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-slate-200 bg-slate-50 text-slate-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export function Alert({
  className = "",
  variant = "info",
  ...props
}: AlertProps) {
  return (
    <div
      className={`rounded-md border px-4 py-3 text-sm ${variants[variant]} ${className}`}
      role="alert"
      {...props}
    />
  );
}
