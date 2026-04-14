"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User } from "@/lib/types";
import { Trophy, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface RankingData {
  technician: User;
  normalizedActual: number;
}

export function RankingTable({ data }: { data: RankingData[] }) {
  const sorted = [...data].sort((a, b) => b.normalizedActual - a.normalizedActual);

  const getRankIcon = (index: number) => {
    if (index === 0) return <div className="p-1.5 bg-yellow-100 rounded-lg"><Trophy className="h-5 w-5 text-yellow-600" /></div>;
    if (index === 1) return <div className="p-1.5 bg-slate-100 rounded-lg"><Medal className="h-5 w-5 text-slate-500" /></div>;
    if (index === 2) return <div className="p-1.5 bg-amber-50 rounded-lg"><Award className="h-5 w-5 text-amber-700" /></div>;
    return <span className="font-black text-muted-foreground text-sm w-8 h-8 flex items-center justify-center bg-secondary/50 rounded-full">{index + 1}</span>;
  };

  return (
    <div className="bg-card rounded-2xl shadow-xl border overflow-hidden">
      <div className="bg-primary px-6 py-5">
        <h3 className="font-black text-xl text-primary-foreground tracking-tight">ترتيب النخبة</h3>
        <p className="text-xs text-primary-foreground/70 font-bold uppercase tracking-widest mt-1">أعلى الفنيين إنتاجية</p>
      </div>
      <Table>
        <TableHeader className="bg-secondary/50">
          <TableRow>
            <TableHead className="w-20 text-center font-bold">الترتيب</TableHead>
            <TableHead className="font-bold">الفني</TableHead>
            <TableHead className="text-left font-bold">الإنتاجية</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((item, index) => {
            const isChimney = item.technician.type === 'فني مدخنة';
            return (
              <TableRow key={item.technician.id} className={cn("transition-colors", index === 0 && "bg-yellow-50/30")}>
                <TableCell className="text-center">
                  <div className="flex justify-center">{getRankIcon(index)}</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-black text-sm">{item.technician.name}</span>
                    <span className={cn("text-[10px] font-bold uppercase tracking-tighter", isChimney ? "text-blue-600" : "text-emerald-600")}>
                      {item.technician.type}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-left">
                  <div className={cn(
                    "font-black text-base tabular-nums",
                    isChimney ? "text-blue-700" : "text-emerald-700"
                  )}>
                    {item.normalizedActual.toFixed(1)}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}