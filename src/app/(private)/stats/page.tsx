import { getStats } from "@/actions/stats";
import StatTable from "@/components/stats/stat-table";
export default async function StatsPage() {
  const { data } = await getStats();

  return (
    <div className="container mx-auto p-8">
      <div className="grid gap-8">
        <StatTable data={data} />
      </div>
    </div>
  );
}
