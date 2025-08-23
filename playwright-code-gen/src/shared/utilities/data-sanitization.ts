/**
 * Data sanitization utilities for test data
 */

export interface SanitizedCategoryData {
  name: string;
  icon?: string;
}

export function sanitizeCategoryData(
  data: Record<string, string>
): SanitizedCategoryData {
  const name = (data.name ?? data.Name ?? '').trim();
  const icon = (data.icon ?? data.Icon ?? '').trim() || undefined;

  return { name, icon };
}
