import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const SITE_NAME = "NeoDevNotebook"
export const GITHUB_URL = "https://github.com/Aman554-EQ"
