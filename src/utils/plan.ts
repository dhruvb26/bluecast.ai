const planMap = [
  { id: "price_1Pb0w5RrqqSKPUNWGX1T2G3O", plan: "Launch" },
  { id: "price_1QMcQPRrqqSKPUNWXMw3yYy8", plan: "Launch" },
];

export function getPlanType(priceId: string | null): string {
  if (!priceId) return "Trial";

  const matchedPlan = planMap.find((item) => item.id === priceId);
  return matchedPlan ? matchedPlan.plan : "Testing";
}
