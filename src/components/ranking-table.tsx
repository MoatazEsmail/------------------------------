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
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-slate-400" />;
    if (index === 2) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="font-bold text-muted-foreground">{index + 1}</span>;
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
      <div className="bg-primary/5 px-6 py-4 border-b">
        <h3 className="font-bold text-lg">ترتيب الفنيين</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 text-center">المركز</TableHead>
            <TableHead>الفني</TableHead>
            <TableHead>النوع</TableHead>
            <TableHead className="text-left">الإنتاجية المحققة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((item, index) => (
            <TableRow key={item.technician.id} className={cn(index === 0 && "bg-primary/5")}>
              <TableCell className="text-center flex justify-center">{getRankIcon(index)}</TableCell>
              <TableCell className="font-bold">{item.technician.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{item.technician.type}</TableCell>
              <TableCell className="text-left font-bold text-primary">
                {item.normalizedActual.toFixed(1)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}