export function getNameInitials(name: string) {
  const parts = name.split(" ");

  if (parts.length === 1) return parts[0].charAt(0);

  return parts[0].charAt(0) + parts[1].charAt(0);
}
