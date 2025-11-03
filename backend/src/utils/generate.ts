export function genCodigoSequential(prefix: string, n: number) {
  return `${prefix}${String(n).padStart(3, "0")}`;
}
export function genSeguimiento() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({length:9}, () => chars[Math.floor(Math.random()*chars.length)]).join("");
}
