// Utility for generating unique test data names
export function generateCategoryName(
  base: string,
  scenarioId?: string
): string {
  return scenarioId ? `${scenarioId}_${base}` : base;
}

export function generateUniqueNameByLength(
  length: number,
  scenarioId?: string
): string {
  // Generate a fully random string of the requested length
  function randomString(len: number) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < len; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  let prefix = scenarioId || "";
  if (prefix.length > length) {
    prefix = prefix.substring(0, length);
  }
  const randomLen = length - prefix.length;
  const randomPart = randomLen > 0 ? randomString(randomLen) : "";
  return prefix + randomPart;
}
