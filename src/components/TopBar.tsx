"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ReactNode } from "react";

export function TopBar({ title, right, noBack }: { title: string; right?: ReactNode; noBack?: boolean }) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-2.5 px-1 pb-3 pt-1.5">
      {!noBack && (
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 flex-none items-center justify-center rounded-full border"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
          aria-label="Retour"
        >
          <ChevronLeft size={18} />
        </button>
      )}
      <h2 className="flex-1 font-[var(--font-display)] text-[18px] font-semibold" style={{ color: "var(--ink)" }}>
        {title}
      </h2>
      {right || <span className="w-9" />}
    </div>
  );
}
