export function convert(amount: number, rate: number): number {
  return amount * rate;
}

export function formatRate(rate: number): string {
  return rate >= 100 ? rate.toFixed(2) : rate.toFixed(4);
}