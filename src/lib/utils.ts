export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function formatTime(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "сейчас";
  if (diffMin < 60) return `${diffMin}м`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}ч`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}д`;
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
