import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {ChartData} from "@domain/dashboard/entities";

interface ActivityChartProps {
  data: ChartData[];
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  return (
    <div className="bg-card rounded-lg p-5 shadow-[0_1px_10px_rgba(11,59,73,0.06)] dark:shadow-[0_1px_12px_rgba(0,0,0,0.2)] border border-ui-border overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[0.9375rem] font-semibold text-foreground">
          Patient Activity
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <span className="text-[0.75rem] text-text-muted font-medium uppercase tracking-widest">
            Total Patients Visited
          </span>
        </div>
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="var(--chart-grid)"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{fill: "var(--text-muted)", fontSize: 10, fontWeight: 500}}
              dy={10}
            />
            <YAxis hide />
            <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={20}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index % 2 === 0 ? "#0f8aa3" : "#28b8a5"}
                  fillOpacity={0.92}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
