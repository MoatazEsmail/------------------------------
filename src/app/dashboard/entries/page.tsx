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
import { Plus, Trash2, Edit2, Check, User as UserIcon } from "lucide-react";
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
      setFormData(prev => ({ ...prev, technicianId: user.role === 'technician' ? user.id : "" }));
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

  if (!currentUser) return null;

  const isSupervisor = currentUser.role === 'supervisor';
  const allEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSupervisor && !formData.technicianId) {
      toast({ title: "خطأ", description: "يرجى اختيار الفني أولاً", variant: "destructive" });
      return;
    }

    const newEntry: ProductivityEntry = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      technicianId: formData.technicianId || currentUser.id,
      ...formData
    };

    try {
      await saveEntry(newEntry);
      const updatedEntries = await getEntries();
      setEntries(updatedEntries);
      
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

      toast({ title: "تم الحفظ", description: "تم تسجيل الإنتاجية بنجاح" });
    } catch (error) {
      toast({ title: "خطأ", description: "فشل الحفظ، حاول مرة أخرى", variant: "destructive" });
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
    if (confirm("هل أنت متأكد من حذف هذا السجل؟")) {
      await deleteEntry(id);
      setEntries(await getEntries());
      toast({ title: "تم الحذف", description: "تم حذف السجل بنجاح" });
    }
  };

  const getTechName = (id: string) => TECHNICIANS.find(t => t.id === id)?.name || "غير معروف";
  const getTechType = (id: string) => TECHNICIANS.find(t => t.id === id)?.type || "";

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 text-right">
        <h2 className="text-3xl font-black text-primary">لوحة السجلات العامة</h2>
        <p className="text-muted-foreground font-bold text-lg">متابعة إنتاجية فريق العمل</p>
      </div>

      <Card className="shadow-2xl border-2 border-primary/10">
        <CardHeader className="bg-primary/5 border-b text-right">
          <CardTitle className="text-xl font-black">{editingId ? "تعديل سجل" : "إضافة سجل جديد"}</CardTitle>
          <CardDescription className="text-base font-bold">أدخل تفاصيل الأجهزة المنجزة</CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right" dir="rtl">
            {isSupervisor ? (
              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label className="font-bold text-lg">اختر الفني</Label>
                <Select value={formData.technicianId} onValueChange={(v) => setFormData({...formData, technicianId: v})}>
                  <SelectTrigger className="w-full h-12 border-2 text-lg font-bold">
                    <SelectValue placeholder="اختر اسم الفني" />
                  </SelectTrigger>
                  <SelectContent>
                    {TECHNICIANS.map(tech => (
                      <SelectItem key={tech.id} value={tech.id} className="text-lg font-bold">{tech.name} ({tech.type})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label className="font-bold text-lg opacity-70">الفني الحالي</Label>
                <div className="h-12 flex items-center px-4 bg-secondary/50 rounded-md border-2 border-dashed font-black text-primary text-xl">
                  {currentUser.name}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="font-bold text-lg">التاريخ</Label>
              <Input type="date" className="h-12 border-2 font-black text-lg" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
            </div>

            <div className="space-y-2"><Label className="font-bold text-lg">تحويل بوتجاز</Label><Input type="number" className="h-12 border-2 text-xl font-bold" value={formData.gasStoveConversions} onChange={(e) => setFormData({...formData, gasStoveConversions: parseInt(e.target.value) || 0})} /></div>
            <div className="space-y-2"><Label className="font-bold text-lg">تحويل سخان</Label><Input type="number" className="h-12 border-2 text-xl font-bold" value={formData.waterHeaterConversions} onChange={(e) => setFormData({...formData, waterHeaterConversions: parseInt(e.target.value) || 0})} /></div>
            <div className="space-y-2"><Label className="font-bold text-lg">استبدال منزلي</Label><Input type="number" className="h-12 border-2 text-xl font-bold" value={formData.householdApplianceReplacements} onChange={(e) => setFormData({...formData, householdApplianceReplacements: parseInt(e.target.value) || 0})} /></div>
            <div className="space-y-2"><Label className="font-bold text-lg">استبدال تجاري</Label><Input type="number" className="h-12 border-2 text-xl font-bold" value={formData.commercialApplianceReplacements} onChange={(e) => setFormData({...formData, commercialApplianceReplacements: parseInt(e.target.value) || 0})} /></div>
            <div className="space-y-2"><Label className="font-bold text-lg">تحويل تجاري</Label><Input type="number" className="h-12 border-2 text-xl font-bold" value={formData.commercialApplianceConversions} onChange={(e) => setFormData({...formData, commercialApplianceConversions: parseInt(e.target.value) || 0})} /></div>
            <div className="space-y-2"><Label className="font-bold text-lg">تركيب مداخن</Label><Input type="number" className="h-12 border-2 text-xl font-bold" value={formData.chimneyInstallations} onChange={(e) => setFormData({...formData, chimneyInstallations: parseInt(e.target.value) || 0})} /></div>

            <div className="col-span-1 md:col-span-3 flex gap-4 pt-4">
              <Button type="submit" className="flex-1 h-14 text-xl font-black gap-2 shadow-xl">
                {editingId ? <Check className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                {editingId ? "تحديث البيانات" : "حفظ الإنتاجية"}
              </Button>
              {editingId && (
                <Button variant="outline" className="h-14 px-10 font-black border-2 text-xl" type="button" onClick={() => setEditingId(null)}>إلغاء</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6 text-right">
        <h3 className="text-2xl font-black flex items-center justify-end gap-3">
          <Badge variant="secondary" className="bg-primary/10 text-primary font-black px-4 py-1 text-lg">{allEntries.length} سجل</Badge>
          سجل النشاط العام
        </h3>

        <div className="bg-card rounded-2xl border-2 shadow-xl overflow-hidden" dir="rtl">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow>
                <TableHead className="font-black text-primary text-right text-lg">التاريخ</TableHead>
                <TableHead className="font-black text-primary text-right text-lg">الفني</TableHead>
                <TableHead className="font-black text-primary text-right text-lg">القسم</TableHead>
                <TableHead className="font-black text-primary text-right text-lg">منزلي</TableHead>
                <TableHead className="font-black text-primary text-right text-lg">تجاري</TableHead>
                <TableHead className="font-black text-primary text-right text-lg">مداخن</TableHead>
                <TableHead className="font-black text-primary text-center text-lg">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allEntries.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-20 text-xl font-bold text-muted-foreground">{isLoading ? "جاري التحميل..." : "لا توجد سجلات"}</TableCell></TableRow>
              ) : (
                allEntries.map((entry) => {
                  const isOwner = entry.technicianId === currentUser.id;
                  const canManage = isSupervisor || isOwner;
                  const isChimney = getTechType(entry.technicianId) === 'فني مدخنة';

                  return (
                    <TableRow key={entry.id} className={isOwner ? "bg-primary/5" : ""}>
                      <TableCell className="font-black text-lg">{entry.date}</TableCell>
                      <TableCell><span className="font-black text-primary text-lg">{getTechName(entry.technicianId)}</span></TableCell>
                      <TableCell><Badge className={isChimney ? "bg-blue-600" : "bg-emerald-600"}>{getTechType(entry.technicianId)}</Badge></TableCell>
                      <TableCell className="font-bold text-lg text-center">{entry.gasStoveConversions + entry.waterHeaterConversions + entry.householdApplianceReplacements}</TableCell>
                      <TableCell className="font-bold text-lg text-center">{entry.commercialApplianceReplacements + entry.commercialApplianceConversions}</TableCell>
                      <TableCell className="font-bold text-lg text-center">{entry.chimneyInstallations}</TableCell>
                      <TableCell>
                        {canManage && (
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)} className="text-primary hover:bg-primary/10 h-10 w-10"><Edit2 className="h-5 w-5" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)} className="text-destructive hover:bg-destructive/10 h-10 w-10"><Trash2 className="h-5 w-5" /></Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
