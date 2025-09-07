export function cn(...a: (string | undefined | false)[]) {
  return a.filter(Boolean).join(" ");
}
