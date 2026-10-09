import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  const clsFn = typeof clsx === "function" ? clsx : (clsx as any)?.clsx || (clsx as any)?.default;
  const rawClass = typeof clsFn === "function" ? clsFn(inputs) : inputs.filter(Boolean).join(" ");
  const mergeFn = typeof twMerge === "function" ? twMerge : (twMerge as any)?.twMerge || (twMerge as any)?.default;
  return typeof mergeFn === "function" ? mergeFn(rawClass) : rawClass;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
