"use client";

import { useState, useEffect } from "react";
import { User, ProductivityEntry, TECHNICIANS } from "@/lib/types";
import { getEntries } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Activity, Zap, ChevronLeft } from "lucide-react";

export default function DashboardPage() {
  const [entries, setEntries] = useState<ProductivityEntry[]>([]);
  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await getEntries();
      setEntries(data || []);
    };
    loadData();
  }, []);

  // حساب إنتاجية كل فني وترتيبهم من الأعلى للأقل
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
    <div className="p-6 space-y-8 bg-[#0a0a0b] min-h-screen text-slate-100" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-l from-emerald-400 to-cyan-400">
          منظومة Town Gas 2026
        </h1>
        <p className="text-slate-400 font-bold">لوحة التحكم والمتابعة الميدانية</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* قائمة الفنيين (مرتبة حسب الأداء) */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xl font-black flex items-center gap-2">
            <Users className="text-emerald-500" /> ترتيب الفنيين
          </h3>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
            {techStats.map((tech, index) => (
              <div 
                key={tech.id}
                onClick={() => setSelectedTech(tech.id)}
                className={`group relative p-4 rounded-2xl border-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 ${
                  selectedTech === tech.id 
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-emerald-400 border border-slate-700">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-black text-lg">{tech.name}</h4>
                      <p className="text-xs text-slate-500 font-bold uppercase">{tech.type}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-black text-emerald-400">{tech.totalPoints}</div>
                    <p className="text-[10px] text-slate-500 font-bold">نقطة تراكمية</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* تفاصيل إنتاجية الفني المختار */}
        <div className="lg:col-span-2">
          {selectedTech ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <Badge className="mb-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-3 py-1">ملف الإنجاز</Badge>
                    <h2 className="text-3xl font-black">{selectedTechData?.name}</h2>
                  </div>
                  <Zap className="text-yellow-400 h-8 w-8 animate-pulse" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatBox label="إجمالي الأجهزة" value={selectedTechData?.totalPoints} color="text-emerald-400" />
                  <StatBox label="أيام العمل" value={selectedTechData?.entriesCount} color="text-cyan-400" />
                  <StatBox label="متوسط الأداء" value={(selectedTechData!.totalPoints / (selectedTechData!.entriesCount || 1)).toFixed(1)} color="text-purple-400" />
                  <StatBox label="التصنيف" value={selectedTechData!.totalPoints > 50 ? "A+" : "B"} color="text-orange-400" />
                </div>
              </div>

              <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-6">
                <h3 className="text-lg font-black mb-4">آخر العمليات الميدانية</h3>
                <div className="space-y-3">
                  {selectedTechEntries.slice(0, 5).map((entry, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
                      <span className="font-bold text-slate-400">{entry.date}</span>
                      <div className="flex gap-4">
                        <span className="text-emerald-400 font-black">+{entry.gasStoveConversions + entry.waterHeaterConversions} منزلي</span>
                        <span className="text-cyan-400 font-black">+{entry.chimneyInstallations} مدخنة</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl p-20">
              <Activity className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-xl font-bold italic text-center">قم باختيار فني من القائمة الجانبية<br/>لعرض تقرير الأداء المفصل</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string, value: any, color: string }) {
  return (
    <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
      <p className="text-xs font-bold text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}
