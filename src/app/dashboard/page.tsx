"use client";

import { useState, useEffect } from "react";
import { User, ProductivityEntry, TECHNICIANS } from "@/lib/types";
import { getEntries } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Target, Activity, TrendingUp, ChevronLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [entries, setEntries] = useState<ProductivityEntry[]>([]);
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await getEntries();
      setEntries(data || []);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // حساب إحصائيات الفنيين وترتيبهم
  const techStats = TECHNICIANS.map(tech => {
    const techEntries = entries.filter(e => e.technicianId === tech.id);
    const totalPoints = techEntries.reduce((sum, e) => 
      sum + (e.gasStoveConversions + e.waterHeaterConversions + e.householdApplianceReplacements + 
      e.commercialApplianceReplacements + e.commercialApplianceConversions + e.chimneyInstallations), 0);
    
    return { ...tech, totalPoints, entriesCount: techEntries.length };
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  const selectedTechData = techStats.find(t => t.id === selectedTech);
  const selectedTechEntries = entries.filter(e => e.technicianId === selectedTech);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12" dir="rtl">
      {/* Header / Top Bar */}
      <div className="bg-[#0f172a] text-white pt-8 pb-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-emerald-400">Town Gas Style</h1>
            <p className="text-slate-400 font-bold">منظومة متابعة الإنتاجية الميدانية - 2026</p>
          </div>
          
          {/* زر إضافة إنتاجية - واضح واحترافي */}
          <Link href="/dashboard/entries">
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 h-14 rounded-2xl shadow-lg shadow-emerald-900/20 group transition-all">
              <Plus className="ml-2 h-6 w-6 group-hover:rotate-90 transition-transform" />
              تسجيل إنتاجية جديدة
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* قائمة ترتيب الفنيين */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" /> ترتيب الأداء
            </h3>
            <Badge variant="outline" className="border-slate-300 font-bold">{techStats.length} فني</Badge>
          </div>
          
          <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar">
            {techStats.map((tech, index) => (
              <div 
                key={tech.id}
                onClick={() => setSelectedTech(tech.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  selectedTech === tech.id 
                  ? 'border-emerald-600 bg-white shadow-xl translate-x-[-8px]' 
                  : 'border-white bg-white hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                    index === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 leading-tight">{tech.name}</h4>
                    <p className="text-xs font-bold text-slate-500 uppercase">{tech.type}</p>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-xl font-black text-emerald-600">{tech.totalPoints}</div>
                  <p className="text-[10px] text-slate-400 font-bold">نقطة</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* عرض التفاصيل */}
        <div className="lg:col-span-8">
          {selectedTech ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
              <Card className="border-none shadow-xl overflow-hidden rounded-3xl">
                <div className="bg-gradient-to-l from-slate-900 to-slate-800 p-8 text-white relative">
                  <div className="relative z-10 flex justify-between items-center">
                    <div>
                      <Badge className="bg-emerald-500 text-white border-none mb-3 px-3">تقرير مفصل</Badge>
                      <h2 className="text-4xl font-black">{selectedTechData?.name}</h2>
                      <p className="text-slate-400 font-bold mt-1 text-lg">{selectedTechData?.type}</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 text-center min-w-[100px]">
                      <div className="text-3xl font-black text-emerald-400">{selectedTechData?.totalPoints}</div>
                      <p className="text-[10px] font-bold text-white/60">الإجمالي</p>
                    </div>
                  </div>
                  <TrendingUp className="absolute left-[-20px] bottom-[-20px] h-48 w-48 text-white/5 -rotate-12" />
                </div>
                
                <CardContent className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6 bg-white">
                  <QuickStat label="أيام النشاط" value={selectedTechData?.entriesCount} icon={<Activity className="h-4 w-4" />} />
                  <QuickStat label="المعدل اليومي" value={(selectedTechData!.totalPoints / (selectedTechData!.entriesCount || 1)).toFixed(1)} icon={<Target className="h-4 w-4" />} />
                  <QuickStat label="التصنيف" value={selectedTechData!.totalPoints > 40 ? "ممتاز" : "جيد"} icon={<TrendingUp className="h-4 w-4" />} />
                  <QuickStat label="آخر تحديث" value={selectedTechEntries[0]?.date || "-"} icon={<ChevronLeft className="h-4 w-4" />} />
                </CardContent>
              </Card>

              <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
                <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                  آخر العمليات المسجلة
                  <ArrowUpRight className="h-5 w-5 text-slate-400" />
                </h3>
                <div className="space-y-3">
                  {selectedTechEntries.slice(0, 5).map((entry, i) => (
                    <div key={i} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-emerald-200 transition-all">
                      <div>
                        <span className="font-black text-slate-700 block">{entry.date}</span>
                        <span className="text-xs font-bold text-slate-400 uppercase">سجل ميداني</span>
                      </div>
                      <div className="flex gap-4">
                        <Badge className="bg-white text-emerald-700 border-emerald-100 px-3">+{entry.gasStoveConversions + entry.waterHeaterConversions} منزلي</Badge>
                        <Badge className="bg-white text-blue-700 border-blue-100 px-3">+{entry.chimneyInstallations} مدخنة</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white h-[60vh] rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 shadow-inner">
              <div className="p-6 bg-slate-50 rounded-full mb-4">
                <Users className="h-12 w-12 opacity-30" />
              </div>
              <p className="text-xl font-black text-center">قم باختيار فني من القائمة<br/><span className="text-sm font-bold text-slate-400 mt-2 block">لعرض لوحة بياناته المفصلة</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickStat({ label, value, icon }: { label: string, value: any, icon: any }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-black text-slate-800">{value}</div>
    </div>
  );
}
