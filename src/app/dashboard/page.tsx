
"use client";

import { useState, useEffect } from "react";
import { User, TECHNICIANS, ProductivityEntry } from "@/lib/types";
import { TechnicianCard } from "@/components/technician-card";
import { RankingTable } from "@/components/ranking-table";
import { getEntries } from "@/lib/store";
import { calculateNormalizedProductivity, filterEntriesByMonth } from "@/lib/conversions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown, TrendingUp, Users, Flame, Info, History, ArrowLeftRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
  
  // الحصول على آخر 5 عمليات مسجلة للظهور في "النشاط العام"
  const recentActivities = [...entries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

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

  const getTechName = (id: string) => TECHNICIANS.find(t => t.id === id)?.name || "غير معروف";
  const getTechType = (id: string) => TECHNICIANS.find(t => t.id === id)?.type || "";

  const months = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 rtl" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary rounded-2xl text-white shadow-xl shadow-primary/20">
            <Flame className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-4xl font-black font-headline tracking-tighter text-primary">تاون جاس</h2>
            <div className="flex flex-col text-sm font-bold text-muted-foreground">
              <span>منطقة مصر الجديدة</span>
              <span className="text-primary/70">إدارة العمليات</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
            <SelectTrigger className="w-44 h-11 bg-card border-2 font-bold shadow-sm">
              <SelectValue placeholder="اختر الشهر" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m, i) => (
                <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={handleExportCSV} variant="outline" className="h-11 gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold transition-all shadow-sm">
            <FileDown className="h-5 w-5" />
            تصدير التقرير الشهري
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="bg-primary text-primary-foreground shadow-2xl border-0 overflow-hidden relative">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 opacity-90">
              <TrendingUp className="h-4 w-4" />
              إجمالي الإنتاجية المحققة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black tracking-tighter">{totalNormalized.toFixed(1)}</div>
            <p className="text-sm font-bold opacity-70 mt-2">المستهدف العام: {totalTarget}</p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-lg border-b-8 border-b-accent relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Users className="h-4 w-4 text-accent" />
              نسبة إنجاز الفريق
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black text-accent-foreground tracking-tighter">{overallPercentage}%</div>
            <div className="w-full bg-secondary h-3 rounded-full mt-4 overflow-hidden shadow-inner">
              <div className="bg-accent h-full transition-all duration-1000 ease-out" style={{ width: `${overallPercentage}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-lg border-b-8 border-b-primary relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-widest">مستوى النجاح</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black text-primary tracking-tighter">
              {technicianStats.filter(s => s.normalizedActual >= (s.technician.target || 0)).length} <span className="text-2xl text-muted-foreground">/ {TECHNICIANS.length}</span>
            </div>
            <p className="text-sm font-bold text-muted-foreground mt-2">فنيون حققوا أهدافهم بالكامل</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Technicians & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
            <h3 className="text-2xl font-black font-headline text-foreground flex items-center gap-3">
              نظرة تفصيلية على القوة العاملة
              <Badge variant="secondary" className="font-bold text-xs uppercase px-3 py-1">محدث الآن</Badge>
            </h3>
            <div className="flex gap-6 items-center bg-secondary/30 p-2 px-4 rounded-xl border">
              <span className="flex items-center gap-2 text-xs font-black">
                <span className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-sm"></span> قسم المداخن
              </span>
              <span className="flex items-center gap-2 text-xs font-black">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm"></span> قسم التحويلات
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {technicianStats.map(stat => (
              <TechnicianCard 
                key={stat.technician.id} 
                technician={stat.technician} 
                normalizedActual={stat.normalizedActual}
                onClick={(id) => router.push(`/dashboard/technician/${id}?month=${selectedMonth}&year=${selectedYear}`)}
              />
            ))}
          </div>

          {/* Recent Public Activity Feed */}
          <Card className="border-2 shadow-xl overflow-hidden">
            <CardHeader className="bg-secondary/50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <History className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black">آخر النشاطات العامة</CardTitle>
                    <CardDescription>آخر العمليات المسجلة من قبل الفريق في المنطقة</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => router.push('/dashboard/entries')} className="text-primary font-bold">
                  عرض الكل
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">الفني</TableHead>
                    <TableHead className="font-bold">التاريخ</TableHead>
                    <TableHead className="font-bold">الإنتاجية</TableHead>
                    <TableHead className="text-left font-bold">القسم</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivities.map((activity) => {
                    const techType = getTechType(activity.technicianId);
                    const isChimney = techType === 'فني مدخنة';
                    return (
                      <TableRow key={activity.id} className="hover:bg-muted/30">
                        <TableCell className="font-black text-primary">{getTechName(activity.technicianId)}</TableCell>
                        <TableCell className="text-xs font-bold">{activity.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                             <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />
                             <span className="font-bold">{activity.gasStoveConversions + activity.waterHeaterConversions + activity.chimneyInstallations} عمل</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-left">
                           <Badge variant="outline" className={isChimney ? "border-blue-500 text-blue-600" : "border-emerald-500 text-emerald-600"}>
                              {techType}
                           </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {recentActivities.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">لا توجد نشاطات حديثة</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-4 space-y-8">
          <RankingTable data={technicianStats} />
          
          <Card className="bg-primary/5 border-primary/20 border-dashed border-2">
            <CardContent className="pt-6 flex gap-4">
              <Info className="h-6 w-6 text-primary shrink-0" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm">ملاحظة التحويل</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  الإنتاجية الموحدة تعتمد على قواعد الشركة: <br/>
                  • 3 أجهزة منزلية = 1 مدخنة <br/>
                  • جهاز تجاري واحد = 1.5 جهاز منزلي
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
