
"use client";

import { User, TechnicianType } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, User as UserIcon, CheckCircle, AlertCircle } from "lucide-react";
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
  const unitLabel = technician.type === 'فني مدخنة' ? 'مدخنة' : 'جهاز';
  
  // Custom colors based on type
  const isChimney = technician.type === 'فني مدخنة';
  const typeColorClass = isChimney ? "border-r-blue-500 hover:border-r-blue-600" : "border-r-teal-500 hover:border-r-teal-600";
  const iconBgClass = isChimney ? "bg-blue-100 text-blue-600" : "bg-teal-100 text-teal-600";
  const progressColor = isAchieved ? "bg-status-green" : "bg-status-red";

  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-lg transition-all duration-300 group border-r-4",
        typeColorClass
      )}
      onClick={() => onClick(technician.id)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-full transition-colors", iconBgClass)}>
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">{technician.name}</CardTitle>
              <p className={cn("text-xs font-bold", isChimney ? "text-blue-600" : "text-teal-600")}>{technician.type}</p>
            </div>
          </div>
          <Badge variant={isAchieved ? "default" : "destructive"} className={cn("px-2 py-1", isAchieved ? "bg-status-green" : "bg-status-red")}>
            {isAchieved ? <CheckCircle className="h-3 w-3 mr-1 inline" /> : <AlertCircle className="h-3 w-3 mr-1 inline" />}
            {isAchieved ? "حقق الهدف" : "أقل من الهدف"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm font-medium">
            <span>الإنتاجية: <span className="text-primary font-bold">{normalizedActual.toFixed(1)}</span> / {target} {unitLabel}</span>
            <span>{percentage}%</span>
          </div>
          <Progress value={percentage} className={cn("h-2")} />
          <style jsx global>{`
            .group .bg-primary {
              background-color: ${isAchieved ? 'hsl(var(--status-success))' : 'hsl(var(--status-error))'} !important;
            }
          `}</style>
          <div className="flex justify-end pt-2">
            <span className="text-xs text-muted-foreground flex items-center group-hover:text-primary">
              عرض التفاصيل <ChevronLeft className="h-3 w-3 mr-1" />
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
