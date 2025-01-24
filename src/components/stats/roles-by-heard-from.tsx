"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RolesByHeardFromProps {
  rolesByHeardFrom: {
    [source: string]: {
      [role: string]: number;
    };
  };
}

const roles = [
  "Professional",
  "B2B Marketer",
  "Entrepreneur",
  "B2B Creator",
  "B2B Founder",
  "Student",
  "Job Seeker",
  "Other",
];

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#8dd1e1",
];

export default function RolesByHeardFrom({
  rolesByHeardFrom,
}: RolesByHeardFromProps) {
  const data = Object.entries(rolesByHeardFrom).map(([name, roles]) => ({
    name,
    ...roles,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roles by Heard From</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={roles.reduce(
            (acc, role, index) => ({
              ...acc,
              [role]: {
                label: role,
                color: COLORS[index],
              },
            }),
            {}
          )}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Legend />
              {roles.map((role, index) => (
                <Bar
                  key={role}
                  dataKey={role}
                  stackId="a"
                  fill={COLORS[index]}
                />
              ))}
              <ChartTooltip content={<ChartTooltipContent />} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
