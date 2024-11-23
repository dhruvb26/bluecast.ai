"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC0CB",
  "#A52A2A",
];

export default function StatTable({ data }: { data: any }) {
  const roleData = Object.entries(data.roleBreakdown).map(([name, value]) => ({
    name,
    value,
  }));
  const heardFromData = Object.entries(data.heardFromBreakdown).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm tracking-tight font-normal text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold tracking-tight">
              {data.totalUsers}
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm tracking-tight font-normal text-muted-foreground">
              Completed Onboarding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold tracking-tight">
              {data.completedOnboarding}
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm tracking-tight font-normal text-muted-foreground">
              Not Completed Onboarding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold tracking-tight">
              {data.notCompletedOnboarding}
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm tracking-tight font-normal text-muted-foreground">
              Onboarding Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold tracking-tight">
              {((data.completedOnboarding / data.totalUsers) * 100).toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="hover:shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg tracking-tight font-semibold text-foreground">
              Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  className="text-xs"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {roleData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip wrapperClassName="rounded-lg text-xs font-normal border border-input" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="hover:shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg tracking-tight font-semibold text-foreground">
              Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={heardFromData.map((item) => ({
                  ...item,
                  name:
                    item.name === "youtube"
                      ? "YouTube"
                      : item.name.charAt(0).toUpperCase() +
                        item.name.slice(1).toLowerCase(),
                }))}
              >
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip wrapperClassName="rounded-lg text-xs font-normal border border-input" />

                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="hover:shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg tracking-tight font-semibold text-foreground">
            Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Professional</TableHead>
                <TableHead>B2B Marketer</TableHead>
                <TableHead>Entrepreneur</TableHead>
                <TableHead>B2B Creator</TableHead>
                <TableHead>B2B Founder</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Job Seeker</TableHead>
                <TableHead>Other</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(data.rolesByHeardFrom).map(([source, roles]) => (
                <TableRow key={source} className="font-normal ">
                  <TableCell className="font-medium first-letter:uppercase">
                    {source === "youtube" ? "YouTube" : source}
                  </TableCell>
                  <TableCell>
                    {(roles as Record<string, number>).Professional || 0}
                  </TableCell>
                  <TableCell>
                    {(roles as Record<string, number>)["B2B Marketer"] || 0}
                  </TableCell>
                  <TableCell>
                    {(roles as Record<string, number>).Entrepreneur || 0}
                  </TableCell>
                  <TableCell>
                    {(roles as Record<string, number>)["B2B Creator"] || 0}
                  </TableCell>
                  <TableCell>
                    {(roles as Record<string, number>)["B2B Founder"] || 0}
                  </TableCell>
                  <TableCell>
                    {(roles as Record<string, number>).Student || 0}
                  </TableCell>
                  <TableCell>
                    {(roles as Record<string, number>)["Job Seeker"] || 0}
                  </TableCell>
                  <TableCell>
                    {(roles as Record<string, number>).Other || 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
