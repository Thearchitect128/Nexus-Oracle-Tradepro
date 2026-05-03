export function logInfo(message: string, meta?: unknown): void {
  if (meta === undefined) {
    console.info(message);
    return;
  }
  console.info(message, meta);
}
