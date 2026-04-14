"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { TECHNICIANS, User, ProductivityEntry } from "@/lib/types";
import { getEntries, deleteEntry } from "@/lib/store";
import { calculateNormalizedProductivity, filterEntriesByMonth } from "@/lib/conversions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, CheckCircle, BrainCircuit, Target, ListChecks, Trash2, Edit2, HardHat, Drill } from "lucide-react";
import { useRouter } from "next/navigation";
import { generateTechnicianPerformanceSummary, GenerateTechnicianPerformanceSummaryOutput } from "@/ai/flows/generate-technician-performance-summary";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function TechnicianDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const id = params.id as string;
  const month = parseInt(searchParams.get("month") || new Date().getMonth().toString());
  const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

  const [tech, setTech] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<ProductivityEntry[]>([]);
  const [aiSummary, setAiSummary] = useState<GenerateTechnicianPerformanceSummaryOutput | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const technician = TECHNICIANS.find(t => t.id === id);
    if (technician) setTech(technician);
    
    const stored = localStorage.getItem("current_user");
    if (stored) setCurrentUser(JSON.parse(stored));
    
    setEntries(getEntries());
  }, [id]);

  useEffect(() => {
    if (tech && entries.length > 0) {
      handleGenerateSummary();
    }
  }, [tech, entries, month, year]);

  if (!tech) return null;

  const isSupervisor = currentUser?.role === 'supervisor';
  const currentMonthEntries = filterEntriesByMonth(entries, year, month).filter(e => e.technicianId === tech.id);
  const normalizedActual = currentMonthEntries.reduce((acc, curr) => acc + calculateNormalizedProductivity(curr, tech.type!), 0);
  const target = tech.target || 1;
  const percentage = Math.min(100, Math.round((normalizedActual / target) * 100));
  const isAchieved = normalizedActual >= target;

  const isChimney = tech.type === 'فني مدخنة';
  const deptColor = isChimney ? "text-blue-600" : "text-emerald-600";
  const deptBg = isChimney ? "bg-blue-50" : "bg-emerald-50";
  const deptBorder = isChimney ? "border-blue-500" : "border-emerald-500";
  const DeptIcon = isChimney ? HardHat : Drill;

  const rawBreakdown = currentMonthEntries.reduce((acc, curr) => ({
    gasStoveConversions: acc.gasStoveConversions + curr.gasStoveConversions,
    waterHeaterConversions: acc.waterHeaterConversions + curr.waterHeaterConversions,
    householdApplianceReplacements: acc.householdApplianceReplacements + curr.householdApplianceReplacements,
    commercialApplianceReplacements: acc.commercialApplianceReplacements + curr.commercialApplianceReplacements,
    commercialApplianceConversions: acc.commercialApplianceConversions + curr.commercialApplianceConversions,
    chimneyInstallations: acc.chimneyInstallations + curr.chimneyInstallations,
    convertedAppliancesFromChimneyWork: 0
  }), {
    gasStoveConversions: 0,
    waterHeaterConversions: 0,
    householdApplianceReplacements: 0,
    commercialApplianceReplacements: 0,
    commercialApplianceConversions: 0,
    chimneyInstallations: 0,
    convertedAppliancesFromChimneyWork: 0
  });

  const handleGenerateSummary = async () => {
    setLoadingAi(true);
    try {
      const result = await generateTechnicianPerformanceSummary({
        technicianName: tech.name,
        technicianType: tech.type!,
        month: `${month + 1}/${year}`,
        actualNormalizedProductivity: normalizedActual,
        targetNormalizedProductivity: target,
        performancePercentage: percentage,
        status: isAchieved ? 'حقق الهدف' : 'أقل من الهدف',
        rawProductivityBreakdown: rawBreakdown
      });
      setAiSummary(result);
    } catch (error) {
      console.error("AI Summary generation failed", error);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleDeleteEntry = (entryId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا السجل؟")) {
      deleteEntry(entryId);
      setEntries(getEntries());
      toast({ title: "تم الحذف", description: "تم حذف السجل بنجاح" });
    }
  };

  const months = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 rtl" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-5">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full shadow-sm">
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-2xl shadow-inner", deptBg, deptColor)}>
              <DeptIcon className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-3xl font-black font-headline tracking-tight">{tech.name}</h2>
              <p className={cn("font-bold text-sm tracking-widest uppercase", deptColor)}>
                {tech.type} • شهر {months[month]} {year}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <Badge className={cn("px-4 py-1.5 text-sm font-bold shadow-sm", isAchieved ? "bg-status-green" : "bg-status-red")}>
              {isAchieved ? "محقق للهدف الشهري" : "تحت المستهدف"}
            </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className={cn("border-t-8 shadow-xl overflow-hidden", deptBorder)}>
            <CardHeader className="bg-secondary/30">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" />
                مؤشرات الأداء الرئيسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-8">
              <div className="text-center space-y-2">
                <div className={cn("text-6xl font-black mb-1", deptColor)}>{normalizedActual.toFixed(1)}</div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">الإنتاجية الموحدة المحققة</p>
                <Badge variant="outline" className="text-base px-4 py-1 border-2">من مستهدف {target}</Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-bold">
                  <span>نسبة الإنجاز الإجمالية</span>
                  <span className={deptColor}>{percentage}%</span>
                </div>
                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                   <div 
                    className={cn("h-full transition-all duration-1000", isAchieved ? "bg-status-green" : "bg-status-red")}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t">
                <div className="text-center p-3 bg-secondary/20 rounded-xl">
                  <div className="text-2xl font-black">{rawBreakdown.gasStoveConversions + rawBreakdown.waterHeaterConversions + rawBreakdown.householdApplianceReplacements}</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">أجهزة منزلية</div>
                </div>
                <div className="text-center p-3 bg-secondary/20 rounded-xl">
                  <div className="text-2xl font-black">{rawBreakdown.commercialApplianceReplacements + rawBreakdown.commercialApplianceConversions}</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">أجهزة تجارية</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BrainCircuit className="h-5 w-5 text-accent" />
                تحليل الذكاء الاصطناعي (Genkit)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingAi ? (
                <div className="space-y-4">
                  <div className="h-4 bg-secondary animate-pulse rounded w-full"></div>
                  <div className="h-4 bg-secondary animate-pulse rounded w-3/4"></div>
                  <div className="h-4 bg-secondary animate-pulse rounded w-5/6"></div>
                </div>
              ) : aiSummary ? (
                <div className="space-y-6">
                  <div className="p-4 bg-accent/5 rounded-xl border border-accent/20 leading-relaxed text-sm italic shadow-inner">
                    {aiSummary.summary}
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-black text-sm flex items-center gap-2 text-primary">
                      <Sparkles className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      نقاط القوة المكتشفة
                    </h4>
                    <ul className="text-xs space-y-2 text-muted-foreground pr-2">
                      {aiSummary.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-status-green shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3 pt-2">
                    <h4 className="font-black text-sm text-primary">توصيات إدارية</h4>
                    <ul className="text-xs space-y-2 text-muted-foreground pr-2">
                      {aiSummary.recommendations.map((r, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">اضغط على زر التحديث لتوليد تحليل جديد</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-xl overflow-hidden border-0">
            <CardHeader className="bg-primary text-primary-foreground">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl font-black">
                  <ListChecks className="h-6 w-6" />
                  سجل الإنتاجية التفصيلي
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-secondary/50">
                  <TableRow>
                    <TableHead className="font-bold text-primary">التاريخ</TableHead>
                    <TableHead className="font-bold text-primary">بوتجاز/سخان</TableHead>
                    <TableHead className="font-bold text-primary">منزلي</TableHead>
                    <TableHead className="font-bold text-primary">تجاري</TableHead>
                    <TableHead className="font-bold text-primary">مداخن</TableHead>
                    <TableHead className="text-center font-bold text-primary">الناتج الموحد</TableHead>
                    {isSupervisor && <TableHead className="text-left font-bold text-primary">الإجراءات</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentMonthEntries.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-bold">{entry.date}</TableCell>
                      <TableCell>{entry.gasStoveConversions + entry.waterHeaterConversions}</TableCell>
                      <TableCell>{entry.householdApplianceReplacements}</TableCell>
                      <TableCell>{entry.commercialApplianceReplacements + entry.commercialApplianceConversions}</TableCell>
                      <TableCell>{entry.chimneyInstallations}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={cn("font-black text-base border-2", deptColor, deptBorder)}>
                          {calculateNormalizedProductivity(entry, tech.type!).toFixed(2)}
                        </Badge>
                      </TableCell>
                      {isSupervisor && (
                        <TableCell className="text-left">
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-primary hover:bg-primary/10" onClick={() => router.push('/dashboard/entries')}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteEntry(entry.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {currentMonthEntries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={isSupervisor ? 7 : 6} className="text-center py-20 text-muted-foreground">
                        <div className="flex flex-col items-center gap-3">
                          <ListChecks className="h-12 w-12 opacity-10" />
                          <p className="text-lg">لا توجد سجلات مسجلة لهذا الشهر</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}