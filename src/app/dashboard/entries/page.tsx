"use client";

import { useState, useEffect } from "react";
import { User, ProductivityEntry, TECHNICIANS } from "@/lib/types";
import { getEntries, saveEntry, deleteEntry } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit2, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function EntriesPage() {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<ProductivityEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    technicianId: "",
    date: new Date().toISOString().split('T')[0],
    gasStoveConversions: 0,
    waterHeaterConversions: 0,
    householdApplianceReplacements: 0,
    commercialApplianceReplacements: 0,
    commercialApplianceConversions: 0,
    chimneyInstallations: 0
  });

  // 1. تحميل البيانات عند البداية
  useEffect(() => {
    const stored = localStorage.getItem("current_user");
    if (stored) {
      const user = JSON.parse(stored);
      setCurrentUser(user);
      // إذا كان فني، نثبت معرفه تلقائياً
      if (user.role === 'technician') {
        setFormData(prev => ({ ...prev, technicianId: user.id }));
      }
    }
    refreshData();
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    const data = await getEntries();
    setEntries(data || []);
    setIsLoading(false);
  };

  if (!currentUser) return null;
  const isSupervisor = currentUser.role === 'supervisor';

  // 2. معالجة الحفظ (تعديل أو إضافة)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSupervisor && !formData.technicianId) {
      toast({ title: "تنبيه", description: "يجب اختيار الفني أولاً", variant: "destructive" });
      return;
    }

    // أهم جزء: لو فيه editingId نستخدمه عشان يعدل نفس الخانة
    const finalEntry: ProductivityEntry = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      technicianId: formData.technicianId || currentUser.id,
      ...formData
    };

    try {
      await saveEntry(finalEntry);
      await refreshData(); // تحديث الجدول فوراً من السيرفر
      
      setEditingId(null); // إنهاء وضع التعديل
      resetForm();
      
      toast({ 
        title: editingId ? "تم التحديث" : "تم الحفظ", 
        description: editingId ? "تم تعديل السجل بنجاح" : "تم إضافة إنتاجية جديدة" 
      });
    } catch (error) {
      toast({ title: "خطأ", description: "حدثت مشكلة في الاتصال بالسحاب", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      technicianId: isSupervisor ? "" : currentUser.id,
      date: new Date().toISOString().split('T')[0],
      gasStoveConversions: 0,
      waterHeaterConversions: 0,
      householdApplianceReplacements: 0,
      commercialApplianceReplacements: 0,
      commercialApplianceConversions: 0,
      chimneyInstallations: 0
    });
  };

  // 3. معالجة التعديل (تحميل البيانات في الفورم)
  const handleEdit = (entry: ProductivityEntry) => {
    setEditingId(entry.id); // حفظ الـ ID عشان نعدله
    setFormData({
      technicianId: entry.technicianId,
      date: entry.date,
      gasStoveConversions: entry.gasStoveConversions,
      waterHeaterConversions: entry.waterHeaterConversions,
      householdApplianceReplacements: entry.householdApplianceReplacements,
      commercialApplianceReplacements: entry.commercialApplianceReplacements,
      commercialApplianceConversions: entry.commercialApplianceConversions,
      chimneyInstallations: entry.chimneyInstallations
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. معالجة الحذف (للمشرف)
  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السجل نهائياً؟")) return;
    
    try {
      await deleteEntry(id);
      await refreshData();
      toast({ title: "تم الحذف", description: "تم إزالة السجل من قاعدة البيانات" });
    } catch (error) {
      toast({ title: "خطأ", description: "فشل الحذف، حاول مرة أخرى", variant: "destructive" });
    }
  };

  const getTechName = (id: string) => TECHNICIANS.find(t => t.id === id)?.name || "غير معروف";

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-end border-b pb-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-[#0f172a]">إدارة الإنتاجية</h2>
          <p className="text-slate-500 font-bold">صلاحيات المشرف: تعديل وحذف السجلات</p>
        </div>
        {editingId && (
          <Badge className="bg-amber-500 text-white animate-pulse px-4 py-1">وضع التعديل نشط</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <Card className="lg:col-span-4 border-2 shadow-xl h-fit sticky top-4">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-lg font-black">{editingId ? "تعديل السجل المختارة" : "إضافة سجل جديد"}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSupervisor && (
                <div className="space-y-2">
                  <Label className="font-bold">اسم الفني</Label>
                  <Select value={formData.technicianId} onValueChange={(v) => setFormData({...formData, technicianId: v})}>
                    <SelectTrigger className="h-12 border-2">
                      <SelectValue placeholder="اختر الفني" />
                    </SelectTrigger>
                    <SelectContent>
                      {TECHNICIANS.map(t => <SelectItem key={t.id} value={t.id} className="font-bold">{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label className="font-bold">التاريخ</Label>
                <Input type="date" className="h-12 border-2 font-bold" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-black">بوتجاز</Label>
                  <Input type="number" min="0" className="border-2 font-bold" value={formData.gasStoveConversions} onChange={(e) => setFormData({...formData, gasStoveConversions: parseInt(e.target.value) || 0})} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-black">سخان</Label>
                  <Input type="number" min="0" className="border-2 font-bold" value={formData.waterHeaterConversions} onChange={(e) => setFormData({...formData, waterHeaterConversions: parseInt(e.target.value) || 0})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black">مداخن</Label>
                <Input type="number" min="0" className="h-12 border-2 font-black text-blue-600" value={formData.chimneyInstallations} onChange={(e) => setFormData({...formData, chimneyInstallations: parseInt(e.target.value) || 0})} />
              </div>

              <Button type="submit" className={`w-full h-14 text-lg font-black shadow-lg ${editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                {editingId ? <><Check className="ml-2" /> تحديث الآن</> : <><Plus className="ml-2" /> حفظ السجل</>}
              </Button>
              
              {editingId && (
                <Button variant="ghost" className="w-full font-bold text-slate-400" onClick={() => {setEditingId(null); resetForm();}}>إلغاء التعديل</Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Table Section */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border-2 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-900">
                <TableRow>
                  <TableHead className="text-white text-right font-bold">التاريخ</TableHead>
                  <TableHead className="text-white text-right font-bold">الفني</TableHead>
                  <TableHead className="text-white text-center font-bold">الأجهزة</TableHead>
                  <TableHead className="text-white text-center font-bold">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-10 animate-pulse font-bold">جاري المزامنة مع السحاب...</TableCell></TableRow>
                ) : entries.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-10 text-slate-400">لا توجد بيانات</TableCell></TableRow>
                ) : (
                  entries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry) => (
                    <TableRow key={entry.id} className={editingId === entry.id ? "bg-amber-50" : ""}>
                      <TableCell className="font-bold">{entry.date}</TableCell>
                      <TableCell className="font-black text-[#0f172a]">{getTechName(entry.technicianId)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-black text-sm">
                          {entry.gasStoveConversions + entry.waterHeaterConversions + entry.chimneyInstallations} جهاز
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(entry)} className="text-blue-600 border-blue-100 hover:bg-blue-50 h-10 w-10">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          {isSupervisor && (
                            <Button variant="outline" size="icon" onClick={() => handleDelete(entry.id)} className="text-red-600 border-red-100 hover:bg-red-50 h-10 w-10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
