const planMap = [
  { id: "price_1Pb0w5RrqqSKPUNWGX1T2G3O", plan: "Monthly" },
  { id: "price_1Q1VQ4RrqqSKPUNWMMbGj3yh", plan: "Annual" },
];

export function getPlanType(priceId: string | null): string {
  if (!priceId) return "Trial";

  const matchedPlan = planMap.find((item) => item.id === priceId);
  return matchedPlan ? matchedPlan.plan : "Testing";
}
