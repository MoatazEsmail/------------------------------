"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { TECHNICIANS, User, ProductivityEntry } from "@/lib/types";
import { getEntries } from "@/lib/store";
import { calculateNormalizedProductivity, filterEntriesByMonth } from "@/lib/conversions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sparkles, ArrowRight, CheckCircle, BrainCircuit, Target, ListChecks } from "lucide-react";
import { useRouter } from "next/navigation";
import { generateTechnicianPerformanceSummary, GenerateTechnicianPerformanceSummaryOutput } from "@/ai/flows/generate-technician-performance-summary";

export default function TechnicianDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const id = params.id as string;
  const month = parseInt(searchParams.get("month") || new Date().getMonth().toString());
  const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

  const [tech, setTech] = useState<User | null>(null);
  const [entries, setEntries] = useState<ProductivityEntry[]>([]);
  const [aiSummary, setAiSummary] = useState<GenerateTechnicianPerformanceSummaryOutput | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const technician = TECHNICIANS.find(t => t.id === id);
    if (technician) setTech(technician);
    setEntries(getEntries());
  }, [id]);

  useEffect(() => {
    if (tech && entries.length > 0) {
      handleGenerateSummary();
    }
  }, [tech, entries, month, year]);

  if (!tech) return null;

  const currentMonthEntries = filterEntriesByMonth(entries, year, month).filter(e => e.technicianId === tech.id);
  const normalizedActual = currentMonthEntries.reduce((acc, curr) => acc + calculateNormalizedProductivity(curr, tech.type!), 0);
  const target = tech.target || 1;
  const percentage = Math.min(100, Math.round((normalizedActual / target) * 100));
  const isAchieved = normalizedActual >= target;

  const rawBreakdown = currentMonthEntries.reduce((acc, curr) => ({
    gasStoveConversions: acc.gasStoveConversions + curr.gasStoveConversions,
    waterHeaterConversions: acc.waterHeaterConversions + curr.waterHeaterConversions,
    householdApplianceReplacements: acc.householdApplianceReplacements + curr.householdApplianceReplacements,
    commercialApplianceReplacements: acc.commercialApplianceReplacements + curr.commercialApplianceReplacements,
    commercialApplianceConversions: acc.commercialApplianceConversions + curr.commercialApplianceConversions,
    chimneyInstallations: acc.chimneyInstallations + curr.chimneyInstallations,
    convertedAppliancesFromChimneyWork: 0 // logic simplified
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

  const months = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-secondary">
            <ArrowRight className="h-6 w-6" />
          </button>
          <div>
            <h2 className="text-3xl font-bold font-headline">{tech.name}</h2>
            <p className="text-muted-foreground">{tech.type} - شهر {months[month]} {year}</p>
          </div>
        </div>
        <Badge className={isAchieved ? "bg-status-green" : "bg-status-red"}>
          {isAchieved ? "محقق للهدف الشهري" : "تحت المستهدف"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-t-4 border-primary shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                ملخص الأداء
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-1">{normalizedActual.toFixed(1)}</div>
                <p className="text-sm text-muted-foreground">الإنتاجية الموحدة المحققة</p>
                <div className="mt-2 text-xl font-medium">من أصل {target}</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>نسبة الإنجاز</span>
                  <span className="font-bold">{percentage}%</span>
                </div>
                <Progress value={percentage} className={isAchieved ? "[&>div]:bg-status-green" : "[&>div]:bg-status-red"} />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-lg font-bold">{rawBreakdown.gasStoveConversions + rawBreakdown.waterHeaterConversions + rawBreakdown.householdApplianceReplacements}</div>
                  <div className="text-xs text-muted-foreground">أجهزة منزلية</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{rawBreakdown.commercialApplianceReplacements + rawBreakdown.commercialApplianceConversions}</div>
                  <div className="text-xs text-muted-foreground">أجهزة تجارية</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-accent" />
                تحليل الذكاء الاصطناعي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingAi ? (
                <div className="space-y-3">
                  <div className="h-4 bg-secondary animate-pulse rounded w-full"></div>
                  <div className="h-4 bg-secondary animate-pulse rounded w-3/4"></div>
                  <div className="h-4 bg-secondary animate-pulse rounded w-5/6"></div>
                </div>
              ) : aiSummary ? (
                <div className="space-y-4">
                  <div className="p-3 bg-accent/5 rounded-lg border border-accent/10">
                    <p className="text-sm italic leading-relaxed">{aiSummary.summary}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      <Sparkles className="h-3 w-3 text-yellow-500" />
                      نقاط القوة
                    </h4>
                    <ul className="text-xs space-y-1 list-disc list-inside text-muted-foreground">
                      {aiSummary.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-sm">توصيات للمشرف</h4>
                    <ul className="text-xs space-y-1 list-disc list-inside text-muted-foreground">
                      {aiSummary.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">لم يتم توليد تحليل لهذا الشهر بعد.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary" />
                سجل الإنتاجية اليومي
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>بوتجاز/سخان</TableHead>
                    <TableHead>منزلي (استبدال)</TableHead>
                    <TableHead>تجاري</TableHead>
                    <TableHead>مداخن</TableHead>
                    <TableHead className="text-left font-bold">الناتج الموحد</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentMonthEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.date}</TableCell>
                      <TableCell>{entry.gasStoveConversions + entry.waterHeaterConversions}</TableCell>
                      <TableCell>{entry.householdApplianceReplacements}</TableCell>
                      <TableCell>{entry.commercialApplianceReplacements + entry.commercialApplianceConversions}</TableCell>
                      <TableCell>{entry.chimneyInstallations}</TableCell>
                      <TableCell className="text-left font-bold text-primary">
                        {calculateNormalizedProductivity(entry, tech.type!).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {currentMonthEntries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        لا توجد بيانات مسجلة لهذا الشهر
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