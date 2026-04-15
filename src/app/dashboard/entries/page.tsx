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
import { Plus, Trash2, Edit2, Check } from "lucide-react";
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

  useEffect(() => {
    const stored = localStorage.getItem("current_user");
    if (stored) {
      const user = JSON.parse(stored);
      setCurrentUser(user);
      if (user.role === 'technician') {
        setFormData(prev => ({ ...prev, technicianId: user.id }));
      }
    }
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const data = await getEntries();
      setEntries(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) return null;

  const isSupervisor = currentUser.role === 'supervisor';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSupervisor && !formData.technicianId) {
      toast({ title: "خطأ", description: "يرجى اختيار الفني", variant: "destructive" });
      return;
    }

    const entryData: ProductivityEntry = {
      // لو فيه editingId نستخدمه عشان يعدل نفس الخانة، لو مفيش نعمل ID جديد
      id: editingId || Math.random().toString(36).substr(2, 9),
      technicianId: formData.technicianId || currentUser.id,
      ...formData
    };

    try {
      await saveEntry(entryData);
      await loadAllData(); // تحديث القائمة فوراً
      
      setEditingId(null);
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

      toast({ title: "تم بنجاح", description: editingId ? "تم تحديث السجل" : "تم حفظ السجل الجديد" });
    } catch (error) {
      toast({ title: "خطأ", description: "فشل الحفظ", variant: "destructive" });
    }
  };

  const handleEdit = (entry: ProductivityEntry) => {
    setEditingId(entry.id);
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

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السجل نهائياً؟")) return;
    
    try {
      await deleteEntry(id); // الحذف من فايربيز
      await loadAllData(); // تحديث الجدول
      toast({ title: "تم الحذف", description: "تم مسح السجل من السحاب" });
    } catch (error) {
      toast({ title: "خطأ", description: "لم يتم الحذف، حاول ثانية", variant: "destructive" });
    }
  };

  const getTechName = (id: string) => TECHNICIANS.find(t => t.id === id)?.name || "غير معروف";

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in slide-in-from-bottom-4" dir="rtl">
      <div className="text-right space-y-2">
        <h2 className="text-3xl font-black text-primary">إدارة الإنتاجية</h2>
        <p className="text-muted-foreground font-bold italic">تعديل ومتابعة سجلات الفريق</p>
      </div>

      <Card className="shadow-2xl border-t-4 border-t-primary">
        <CardHeader className="text-right">
          <CardTitle className="text-xl font-black">{editingId ? "تعديل البيانات الحالية" : "إضافة سجل جديد"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
            {isSupervisor && (
              <div className="col-span-1 md:col-span-2 space-y-2">
                <Label className="font-black text-lg">الفني المسئول</Label>
                <Select value={formData.technicianId} onValueChange={(v) => setFormData({...formData, technicianId: v})}>
                  <SelectTrigger className="h-12 border-2 font-bold text-lg">
                    <SelectValue placeholder="اختر الفني من القائمة" />
                  </SelectTrigger>
                  <SelectContent>
                    {TECHNICIANS.map(tech => (
                      <SelectItem key={tech.id} value={tech.id} className="font-bold">{tech.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label className="font-black text-lg">التاريخ</Label>
              <Input type="date" className="h-12 border-2 font-bold text-lg" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
            </div>

            {[
              { id: "gasStoveConversions", label: "تحويل بوتجاز" },
              { id: "waterHeaterConversions", label: "تحويل سخان" },
              { id: "householdApplianceReplacements", label: "استبدال منزلي" },
              { id: "commercialApplianceReplacements", label: "استبدال تجاري" },
              { id: "commercialApplianceConversions", label: "تحويل تجاري" },
              { id: "chimneyInstallations", label: "تركيب مداخن" }
            ].map((item) => (
              <div key={item.id} className="space-y-2">
                <Label className="font-bold text-md">{item.label}</Label>
                <Input 
                  type="number" 
                  min="0"
                  className="h-12 border-2 text-xl font-black" 
                  value={(formData as any)[item.id]} 
                  onChange={(e) => setFormData({...formData, [item.id]: parseInt(e.target.value) || 0})} 
                />
              </div>
            ))}

            <div className="col-span-1 md:col-span-3 flex gap-4 pt-6">
              <Button type="submit" className="flex-1 h-14 text-xl font-black shadow-lg">
                {editingId ? <Check className="ml-2" /> : <Plus className="ml-2" />}
                {editingId ? "تحديث السجل" : "حفظ الإنتاجية"}
              </Button>
              {editingId && (
                <Button variant="outline" className="h-14 px-8 font-bold border-2" type="button" onClick={() => setEditingId(null)}>إلغاء</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="bg-card rounded-xl border shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow>
              <TableHead className="text-right font-black text-lg">التاريخ</TableHead>
              <TableHead className="text-right font-black text-lg">الفني</TableHead>
              <TableHead className="text-center font-black text-lg">الإجمالي</TableHead>
              <TableHead className="text-center font-black text-lg">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-10 font-bold text-muted-foreground italic">{isLoading ? "جاري مزامنة السحاب..." : "لا توجد بيانات مسجلة"}</TableCell></TableRow>
            ) : (
              entries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-bold text-lg">{entry.date}</TableCell>
                  <TableCell className="font-black text-primary text-lg">{getTechName(entry.technicianId)}</TableCell>
                  <TableCell className="text-center font-black text-xl">
                    <Badge className="text-lg bg-primary/10 text-primary border-primary/20">
                      {entry.gasStoveConversions + entry.waterHeaterConversions + entry.householdApplianceReplacements + entry.commercialApplianceReplacements + entry.commercialApplianceConversions + entry.chimneyInstallations}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-4">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)} className="text-blue-600 hover:bg-blue-50"><Edit2 className="h-6 w-6" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)} className="text-destructive hover:bg-red-50"><Trash2 className="h-6 w-6" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
