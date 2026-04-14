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

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-300 group border-r-4 border-r-transparent hover:border-r-primary"
      onClick={() => onClick(technician.id)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">{technician.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{technician.type}</p>
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
          <Progress value={percentage} className={cn("h-2", isAchieved ? "[&>div]:bg-status-green" : "[&>div]:bg-status-red")} />
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