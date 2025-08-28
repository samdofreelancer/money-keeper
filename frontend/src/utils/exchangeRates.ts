// Lightweight currency conversion utility
// NOTE: Rates are placeholders and should be replaced with a proper backend/external provider.

export const ratesToUSD: Record<string, number> = {
  USD: 1,
  EUR: 1.08,   // 1 EUR ≈ 1.08 USD
  GBP: 1.27,   // 1 GBP ≈ 1.27 USD
  JPY: 0.0063, // 1 JPY ≈ 0.0063 USD
  VND: 0.000039, // 1 VND ≈ 0.000039 USD
  AUD: 0.67,
  SGD: 0.74,
  CNY: 0.14,
}

export function normalizeCode(code?: string): string {
  if (!code || typeof code !== 'string') return 'USD'
  return code.toUpperCase()
}

export function convert(amount: number, fromCode?: string, toCode?: string): number {
  const from = normalizeCode(fromCode)
  const to = normalizeCode(toCode)
  if (from === to) return amount
  const fromRate = ratesToUSD[from] ?? 1
  const toRate = ratesToUSD[to] ?? 1
  // Convert to USD then to target
  const amountInUSD = amount * fromRate
  const amountInTarget = amountInUSD / toRate
  return amountInTarget
} 