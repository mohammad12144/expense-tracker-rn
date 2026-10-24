import { fetchProducts, groupBy, isEmail, isStrongPassword, mostExpensive } from './day16';

async function main() {
  const result = await fetchProducts();
  if (!result.ok) {
    console.log('Fetch failed:', result.error);
    return;
  }
  const products = result.value;
  console.log('Count:', products.length);
  console.log('Most expensive:', mostExpensive(products)?.title);
  for (const [category, items] of groupBy(products, (p) => p.category)) {
    console.log(`${category}: ${items.length}`);
  }
  console.log(isEmail('a@b.com'), isEmail('nope'));
  console.log(isStrongPassword('abc12345'), isStrongPassword('short'));
}

main();