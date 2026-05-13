import React from "react";
import {CalendarCheck, CircleDollarSign, Pill, Users} from "lucide-react";
import {StatsCard} from "@domain/dashboard/entities";

interface StatsGridProps {
  stats: StatsCard[];
}

export const StatsGrid: React.FC<StatsGridProps> = ({stats}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "users":
        return <Users className="text-primary" size={20} />;
      case "dollar":
        return <CircleDollarSign className="text-emerald-500" size={20} />;
      case "calendar":
        return <CalendarCheck className="text-brand-accent" size={20} />;
      case "pill":
        return <Pill className="text-rose-500" size={20} />;
      default:
        return <Users className="text-primary" size={20} />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="app-card app-card-hover p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-primary-soft rounded-lg flex items-center justify-center">
              {getIcon(stat.icon)}
            </div>
          </div>
          <p className="text-[0.875rem] text-text-muted font-medium mb-1 tracking-wide">
            {stat.label}
          </p>
          <h3 className="text-[1.5rem] font-semibold text-foreground tracking-tight">
            {stat.value}
          </h3>
        </div>
      ))}
    </div>
  );
};
