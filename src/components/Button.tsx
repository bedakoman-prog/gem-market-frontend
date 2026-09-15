"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type Variant = "primary" | "amber" | "outline" | "danger-outline" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-[var(--teal-700)] text-white",
  amber: "bg-[var(--amber)] text-[#2a1c04]",
  outline: "bg-transparent border border-[var(--line)] text-[var(--text)]",
  "danger-outline": "bg-transparent border border-[var(--clay)] text-[var(--clay)]",
  ghost: "bg-[var(--surface-2)] text-[var(--text)]",
};

interface CommonProps {
  variant?: Variant;
  full?: boolean;
  children: ReactNode;
  icon?: ReactNode;
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant = "primary", full = true, children, icon, className = "", ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-s)] px-4 py-3 text-[13.5px] font-bold transition active:opacity-85 disabled:opacity-55 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${full ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

type LinkButtonProps = CommonProps & { href: string; className?: string };

export function LinkButton({ variant = "primary", full = true, children, icon, href, className = "" }: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-s)] px-4 py-3 text-[13.5px] font-bold transition active:opacity-85 ${VARIANT_CLASSES[variant]} ${full ? "w-full" : ""} ${className}`}
    >
      {icon}
      {children}
    </Link>
  );
}
