import React from "react";
import {Users} from "lucide-react";
import {StatsCard} from "@domain/dashboard/entities";

interface StatsGridProps {
  stats: StatsCard[];
}

export const StatsGrid: React.FC<StatsGridProps> = ({stats}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "users":
        return <Users className="text-purple-500" size={20} />;
      case "dollar":
        return <span className="text-blue-500 font-semibold text-lg">$</span>;
      case "calendar":
        return <span className="text-teal-500 font-semibold text-lg">📅</span>;
      case "pill":
        return <span className="text-red-400 font-semibold text-lg">💊</span>;
      default:
        return <Users className="text-purple-500" size={20} />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-transparent hover:border-blue-100 dark:hover:border-slate-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`w-10 h-10 ${stat.bgColor} dark:bg-slate-800 rounded-xl flex items-center justify-center`}
            >
              {getIcon(stat.icon)}
            </div>
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-medium mb-1">
            {stat.label}
          </p>
          <h3 className="text-2xl font-semibold text-slate-800 dark:text-white tracking-tight">
            {stat.value}
          </h3>
        </div>
      ))}
    </div>
  );
};
