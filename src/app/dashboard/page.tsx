
"use client";

import { useState, useEffect } from "react";
import { User, TECHNICIANS, ProductivityEntry } from "@/lib/types";
import { TechnicianCard } from "@/components/technician-card";
import { RankingTable } from "@/components/ranking-table";
import { getEntries } from "@/lib/store";
import { calculateNormalizedProductivity, filterEntriesByMonth } from "@/lib/conversions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, LayoutDashboard, TrendingUp, Users, Flame } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardHome() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<ProductivityEntry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const stored = localStorage.getItem("current_user");
    if (stored) setCurrentUser(JSON.parse(stored));
    setEntries(getEntries());
  }, []);

  if (!currentUser) return null;

  const currentMonthEntries = filterEntriesByMonth(entries, selectedYear, selectedMonth);
  
  const technicianStats = TECHNICIANS.map(tech => {
    const techEntries = currentMonthEntries.filter(e => e.technicianId === tech.id);
    const normalizedActual = techEntries.reduce((acc, curr) => 
      acc + calculateNormalizedProductivity(curr, tech.type!), 0);
    return { technician: tech, normalizedActual };
  });

  const totalNormalized = technicianStats.reduce((acc, curr) => acc + curr.normalizedActual, 0);
  const totalTarget = TECHNICIANS.reduce((acc, curr) => acc + (curr.target || 0), 0);
  const overallPercentage = Math.round((totalNormalized / totalTarget) * 100) || 0;

  const handleExportCSV = () => {
    const headers = ["الفني", "النوع", "الإنتاجية المحققة", "الهدف", "الحالة"];
    const rows = technicianStats.map(stat => [
      stat.technician.name,
      stat.technician.type,
      stat.normalizedActual.toFixed(1),
      stat.technician.target,
      stat.normalizedActual >= (stat.technician.target || 0) ? "محقق" : "غير محقق"
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(",") + "\n" 
      + rows.map(r => r.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `productivity_report_${selectedMonth + 1}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const months = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary rounded-xl text-white">
            <Flame className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold font-headline text-primary">تاون جاس</h2>
            <p className="text-lg font-semibold">منطقة مصر الجديدة - إدارة العمليات</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
            <SelectTrigger className="w-40 bg-card border-primary">
              <SelectValue placeholder="اختر الشهر" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m, i) => (
                <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={handleExportCSV} variant="outline" className="gap-2 border-primary text-primary hover:bg-primary hover:text-white">
            <FileDown className="h-4 w-4" />
            تصدير تقرير
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary text-primary-foreground shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              إجمالي الإنتاجية الفعلية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalNormalized.toFixed(1)}</div>
            <p className="text-xs opacity-80 mt-1">من إجمالي مستهدف {totalTarget}</p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-l-4 border-l-accent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              نسبة إنجاز الفريق
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent-foreground">{overallPercentage}%</div>
            <div className="w-full bg-secondary h-2 rounded-full mt-2">
              <div className="bg-accent h-full rounded-full" style={{ width: `${overallPercentage}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">فنيون حققوا الهدف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {technicianStats.filter(s => s.normalizedActual >= (s.technician.target || 0)).length} / {TECHNICIANS.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">من إجمالي القوة العاملة</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xl font-bold font-headline">نظرة تفصيلية على الفنيين</h3>
            <div className="flex gap-4 text-xs font-medium">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> قسم المداخن</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-teal-500"></span> قسم التحويلات</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {technicianStats.map(stat => (
              <TechnicianCard 
                key={stat.technician.id} 
                technician={stat.technician} 
                normalizedActual={stat.normalizedActual}
                onClick={(id) => router.push(`/dashboard/technician/${id}?month=${selectedMonth}&year=${selectedYear}`)}
              />
            ))}
          </div>
        </div>
        
        <div>
          <RankingTable data={technicianStats} />
        </div>
      </div>
    </div>
  );
}
