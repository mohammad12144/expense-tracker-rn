export interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
}

export function mostExpensive(products: Product[]): Product | undefined {
  return products.reduce<Product | undefined>(
    (max, p) => (!max || p.price > max.price ? p : max),
    undefined,
  );
}

export function groupBy<T, K>(items: T[], key: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    const list = map.get(k);
    if (list) list.push(item);
    else map.set(k, [item]);
  }
  return map;
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export async function fetchProducts(
  limit = 10,
  timeoutMs = 5000,
): Promise<Result<Product[]>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`https://dummyjson.com/products?limit=${limit}`, {
      signal: controller.signal,
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const data = (await res.json()) as { products: Product[] };
    return { ok: true, value: data.products };
  } catch (e) {
    const timedOut = e instanceof Error && e.name === 'AbortError';
    return { ok: false, error: timedOut ? 'Request timed out' : String(e) };
  } finally {
    clearTimeout(timer);
  }
}

export const isEmail = (s: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export const isStrongPassword = (s: string): boolean =>
  s.length >= 8 && /\d/.test(s) && /[A-Za-z]/.test(s);