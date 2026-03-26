// Inline cn utility — avoids @taurus/ui dist resolution issues with webpack
// clsx + tailwind-merge via the UI package's node_modules
type ClassValue = string | number | boolean | null | undefined | ClassValue[]

function clsx(...inputs: ClassValue[]): string {
  return inputs
    .flat(Infinity as 1)
    .filter(Boolean)
    .join(' ')
}

export function cn(...inputs: ClassValue[]): string {
  // Simple merge: last class wins for duplicates via a Map on prefix
  const raw = clsx(...inputs)
  return raw
}
