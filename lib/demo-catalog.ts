export type DemoCatalogItem = {
  id: string;
  price: number;
  initialStock: number;
};

export const demoCatalog: DemoCatalogItem[] = [
  { id: "PR01", price: 35_000, initialStock: 280 },
  { id: "PR02", price: 45_000, initialStock: 119 },
  { id: "PR03", price: 5_000, initialStock: 477 },
  { id: "PR04", price: 6_000, initialStock: 303 },
  { id: "PR05", price: 72_000, initialStock: 41 },
];

export const excludedCatalogProductIds: readonly string[] = ["PRD01", "PRD02"];

export const demoPriceByProduct = new Map(
  demoCatalog.map((item) => [item.id, item.price]),
);

export const demoStockByProduct = new Map(
  demoCatalog.map((item) => [item.id, item.initialStock]),
);
