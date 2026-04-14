"use client";

import { User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, User as UserIcon, CheckCircle, AlertCircle, HardHat, Drill } from "lucide-react";
import { cn } from "@/lib/utils";

interface TechnicianCardProps {
  technician: User;
  normalizedActual: number;
  onClick: (id: string) => void;
}

export function TechnicianCard({ technician, normalizedActual, onClick }: TechnicianCardProps) {
  const target = technician.target || 0;
  const percentage = Math.min(100, Math.round((normalizedActual / target) * 100)) || 0;
  const isAchieved = normalizedActual >= target;
  
  const isChimney = technician.type === 'فني مدخنة';
  
  // Professional Styling based on Department
  const deptConfig = isChimney ? {
    colorClass: "text-blue-600",
    bgClass: "bg-blue-50",
    borderClass: "border-blue-500",
    hoverBorder: "hover:border-blue-700",
    icon: <HardHat className="h-5 w-5" />,
    label: "قسم المداخن",
    unit: "مدخنة"
  } : {
    colorClass: "text-emerald-600",
    bgClass: "bg-emerald-50",
    borderClass: "border-emerald-500",
    hoverBorder: "hover:border-emerald-700",
    icon: <Drill className="h-5 w-5" />,
    label: "قسم التحويلات",
    unit: "جهاز"
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-300 group border-l-4 shadow-sm",
        deptConfig.borderClass,
        deptConfig.hoverBorder,
        "hover:shadow-md hover:-translate-y-1 active:scale-[0.98]"
      )}
      onClick={() => onClick(technician.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2.5 rounded-xl transition-colors shadow-sm", deptConfig.bgClass, deptConfig.colorClass)}>
              {deptConfig.icon}
            </div>
            <div>
              <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{technician.name}</CardTitle>
              <p className={cn("text-xs font-bold uppercase tracking-wider", deptConfig.colorClass)}>{deptConfig.label}</p>
            </div>
          </div>
          <Badge 
            variant={isAchieved ? "default" : "destructive"} 
            className={cn(
              "px-3 py-1 font-bold", 
              isAchieved ? "bg-status-green hover:bg-status-green" : "bg-status-red hover:bg-status-red"
            )}
          >
            {isAchieved ? <CheckCircle className="h-3.5 w-3.5 mr-1.5 inline" /> : <AlertCircle className="h-3.5 w-3.5 mr-1.5 inline" />}
            {isAchieved ? "محقق" : "تحت المستهدف"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-end text-sm">
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-xs block">الإنتاجية الموحدة</span>
              <span className="text-lg font-black text-foreground">
                {normalizedActual.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">/ {target} {deptConfig.unit}</span>
              </span>
            </div>
            <div className={cn("text-xl font-black", deptConfig.colorClass)}>
              {percentage}%
            </div>
          </div>
          
          <div className="relative h-2.5 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all duration-1000", isAchieved ? "bg-status-green" : "bg-status-red")}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex justify-end pt-2">
            <span className="text-xs font-bold text-muted-foreground flex items-center group-hover:text-primary transition-colors">
              عرض التفاصيل والتحليلات <ChevronLeft className="h-3 w-3 mr-1" />
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}