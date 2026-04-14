"use client";
import { useEffect, useState } from "react";
import { User, ProductivityEntry, TECHNICIANS } from "@/lib/types";
import { getEntries } from "@/lib/store";
import { filterEntriesByMonth, calculateNormalizedProductivity } from "@/lib/conversions";

export default function DashboardHome() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<ProductivityEntry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("current_user");
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getEntries();
        setEntries(data || []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) return <div className="p-10 text-center">جاري تحميل إنتاجية الفريق...</div>;
  if (!currentUser) return <div className="p-10 text-center">يرجى تسجيل الدخول أولاً</div>;

  const currentMonthEntries = filterEntriesByMonth(entries, selectedYear, selectedMonth);

  const technicianStats = TECHNICIANS.map(tech => {
    const techEntries = currentMonthEntries.filter(e => e.technicianId === tech.id);
    const normalizedActual = techEntries.reduce((acc, curr) => 
      acc + calculateNormalizedProductivity(curr, tech.type!), 0);
    return { technician: tech, normalizedActual };
  });

  return (
    <div className="p-4 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-navy-900 border-b pb-2">لوحة إنتاجية فنيين Town Gas</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {technicianStats.sort((a,b) => b.normalizedActual - a.normalizedActual).map((stat) => (
          <div key={stat.technician.id} className="border rounded-lg p-4 shadow-sm bg-slate-50">
            <h3 className="font-bold text-lg">{stat.technician.name}</h3>
            <p className="text-sm text-gray-600">الإنتاجية: {stat.normalizedActual.toFixed(2)} نقطة</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${Math.min(stat.normalizedActual, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
