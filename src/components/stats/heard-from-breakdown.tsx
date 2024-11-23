"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface HeardFromBreakdownProps {
  heardFromBreakdown: {
    [source: string]: number;
  };
}

export default function HeardFromBreakdown({
  heardFromBreakdown,
}: HeardFromBreakdownProps) {
  const data = Object.entries(heardFromBreakdown).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Heard From Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            source: {
              label: "Source",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Bar dataKey="value" fill="var(--color-source)" />
              <ChartTooltip content={<ChartTooltipContent />} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
