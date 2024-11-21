const planMap = [
  // Pro Plan - Monthly
  { id: "price_1Q32F1RrqqSKPUNWkMQXCrVC", plan: "Pro" }, // dev
  { id: "price_1Pb0w5RrqqSKPUNWGX1T2G3O", plan: "Pro" }, // prod

  // Pro Plan - Annual
  { id: "price_1QMOWRRrqqSKPUNWRV27Uiv7", plan: "Pro" }, // dev
  { id: "price_1QN9MVRrqqSKPUNWHqv3bcMM", plan: "Pro" }, // prod

  // Grow Plan - Monthly
  { id: "price_1QLXONRrqqSKPUNW7s5FxANR", plan: "Grow" }, // dev
  { id: "price_1QN9JoRrqqSKPUNWuTZBJWS1", plan: "Grow" }, // prod

  // Grow Plan - Annual
  { id: "price_1QMOYXRrqqSKPUNWcFVWJIs4", plan: "Grow" }, // dev
  { id: "price_1QN9NyRrqqSKPUNWWwB1zAXa", plan: "Grow" }, // prod
];

export function getPlanType(priceId: string | null): string {
  if (!priceId) return "Trial";

  const matchedPlan = planMap.find((item) => item.id === priceId);
  return matchedPlan ? matchedPlan.plan : "Trial";
}
