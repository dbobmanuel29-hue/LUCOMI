import type { Product } from "./types";

const normalize = (text: string) => text.toLocaleLowerCase().replace(/[-_]/g, " ");

/** One search rule for both the header search and the catalogue. */
export function searchProducts(products: Product[], query: string): Product[] {
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return products;

  return products.filter((product) => {
    const searchable = normalize(
      [
        product.name,
        product.category,
        product.shortDescription,
        product.description,
        product.materials,
        ...product.features,
        ...product.variations,
      ].join(" "),
    );
    return terms.every((term) => searchable.includes(term));
  });
}