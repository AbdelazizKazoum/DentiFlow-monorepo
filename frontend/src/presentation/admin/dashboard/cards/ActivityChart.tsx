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
    <div className="app-card p-5 overflow-hidden">
      <div className="flex justify-between items-center pb-4 mb-5 border-b border-ui-border">
        <h3 className="text-[1rem] font-semibold text-foreground">
          Patient Activity
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-[0.8125rem] text-text-muted font-medium uppercase tracking-widest">
            Total Patients Visited
          </span>
        </div>
      </div>
      <div className="h-52 w-full">
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
              tick={{fill: "var(--text-muted)", fontSize: 11, fontWeight: 500}}
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
