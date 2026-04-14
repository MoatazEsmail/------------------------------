
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

// Form State
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
setEntries(getEntries());
}, []);

if (!currentUser) return null;

const isSupervisor = currentUser.role === 'supervisor';

// تظهر كافة السجلات للجميع (العامة) مرتبة بالأحدث
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

      toast({
        title: "تم الحفظ",
        description: "تم تسجيل الإنتاجية بنجاح",
      });
    } catch (error) {
      console.error("Error saving entry:", error);
      toast({ title: "خطأ", description: "حدث خطأ أثناء الحفظ", variant: "destructive" });
    }
  };
    setEntries(await getEntries());
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

toast({
title: "تم الحفظ",
description: "تم تسجيل الإنتاجية بنجاح",
});
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

const handleDelete = (id: string) => {
if (confirm("هل أنت متأكد من حذف هذا السجل؟")) {
deleteEntry(id);
setEntries(getEntries());
toast({ title: "تم الحذف", description: "تم حذف السجل بنجاح" });
}
};

const getTechName = (id: string) => TECHNICIANS.find(t => t.id === id)?.name || "غير معروف";
const getTechType = (id: string) => TECHNICIANS.find(t => t.id === id)?.type || "";

return (
<div className="max-w-6xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500">
<div className="flex flex-col gap-2">
<h2 className="text-3xl font-black font-headline text-primary">لوحة السجلات العامة</h2>
<p className="text-muted-foreground font-bold">عرض ومتابعة الإنتاجية اليومية لجميع فريق العمل</p>
</div>

<Card className="shadow-2xl border-2 border-primary/10">
<CardHeader className="bg-primary/5 border-b">
<CardTitle className="text-xl font-black">{editingId ? "تعديل سجل إنتاجية" : "إضافة سجل إنتاجية جديد"}</CardTitle>
<CardDescription>أدخل تفاصيل الأجهزة التي تم إنجازها</CardDescription>
</CardHeader>
<CardContent className="pt-8">
<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
{isSupervisor ? (
<div className="space-y-2 col-span-1 md:col-span-2">
<Label htmlFor="technician" className="font-bold">اختر الفني</Label>
<Select value={formData.technicianId} onValueChange={(v) => setFormData({...formData, technicianId: v})}>
<SelectTrigger className="w-full h-11 border-2">
<SelectValue placeholder="اختر الفني المسجل له" />
</SelectTrigger>
<SelectContent>
{TECHNICIANS.map(tech => (
<SelectItem key={tech.id} value={tech.id}>{tech.name} ({tech.type})</SelectItem>
))}
</SelectContent>
</Select>
</div>
) : (
<div className="space-y-2 col-span-1 md:col-span-2">
<Label className="font-bold opacity-70">الفني الحالي</Label>
<div className="h-11 flex items-center px-4 bg-secondary/50 rounded-md border-2 border-dashed font-black text-primary">
{currentUser.name}
</div>
</div>
)}

<div className="space-y-2">
<Label htmlFor="date" className="font-bold">التاريخ</Label>
<Input 
id="date" 
type="date" 
className="h-11 border-2 font-bold"
value={formData.date} 
onChange={(e) => setFormData({...formData, date: e.target.value})}
required 
/>
</div>

<div className="space-y-2">
<Label className="font-bold">تحويل بوتجاز</Label>
<Input type="number" min="0" className="h-11 border-2" value={formData.gasStoveConversions} onChange={(e) => setFormData({...formData, gasStoveConversions: parseInt(e.target.value) || 0})} />
</div>

<div className="space-y-2">
<Label className="font-bold">تحويل سخان</Label>
<Input type="number" min="0" className="h-11 border-2" value={formData.waterHeaterConversions} onChange={(e) => setFormData({...formData, waterHeaterConversions: parseInt(e.target.value) || 0})} />
</div>

<div className="space-y-2">
<Label className="font-bold">استبدال أجهزة منزلية</Label>
<Input type="number" min="0" className="h-11 border-2" value={formData.householdApplianceReplacements} onChange={(e) => setFormData({...formData, householdApplianceReplacements: parseInt(e.target.value) || 0})} />
</div>

<div className="space-y-2">
<Label className="font-bold">استبدال أجهزة تجارية</Label>
<Input type="number" min="0" className="h-11 border-2" value={formData.commercialApplianceReplacements} onChange={(e) => setFormData({...formData, commercialApplianceReplacements: parseInt(e.target.value) || 0})} />
</div>

<div className="space-y-2">
<Label className="font-bold">تحويل أجهزة تجارية</Label>
<Input type="number" min="0" className="h-11 border-2" value={formData.commercialApplianceConversions} onChange={(e) => setFormData({...formData, commercialApplianceConversions: parseInt(e.target.value) || 0})} />
</div>

<div className="space-y-2">
<Label className="font-bold">تركيب مداخن</Label>
<Input type="number" min="0" className="h-11 border-2" value={formData.chimneyInstallations} onChange={(e) => setFormData({...formData, chimneyInstallations: parseInt(e.target.value) || 0})} />
</div>

<div className="col-span-1 md:col-span-3 flex gap-4 pt-4">
<Button type="submit" className="flex-1 h-12 text-lg font-black gap-2 shadow-lg shadow-primary/20">
{editingId ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
{editingId ? "تحديث السجل" : "حفظ الإنتاجية"}
</Button>
{editingId && (
<Button variant="outline" className="h-12 px-8 font-bold border-2" type="button" onClick={() => {
setEditingId(null);
setFormData({...formData, technicianId: isSupervisor ? "" : currentUser.id});
}}>
إلغاء
</Button>
)}
</div>
</form>
</CardContent>
</Card>

<div className="space-y-6">
<div className="flex items-center justify-between">
<h3 className="text-2xl font-black font-headline flex items-center gap-3">
سجل النشاط العام
<Badge variant="secondary" className="bg-primary/10 text-primary font-black">
{allEntries.length} سجل
</Badge>
</h3>
</div>

<div className="bg-card rounded-2xl border-2 shadow-xl overflow-hidden">
<Table>
<TableHeader className="bg-secondary/50">
<TableRow>
<TableHead className="font-black text-primary">التاريخ</TableHead>
<TableHead className="font-black text-primary">الفني</TableHead>
<TableHead className="font-black text-primary">القسم</TableHead>
<TableHead className="font-black text-primary">منزلي</TableHead>
<TableHead className="font-black text-primary">تجاري</TableHead>
<TableHead className="font-black text-primary">مداخن</TableHead>
<TableHead className="text-left font-black text-primary">الإجراءات</TableHead>
</TableRow>
</TableHeader>
<TableBody>
{allEntries.length === 0 ? (
<TableRow>
<TableCell colSpan={7} className="text-center py-20 text-muted-foreground">
لا توجد سجلات مسجلة حتى الآن
</TableCell>
</TableRow>
) : (
allEntries.map((entry) => {
const isOwner = entry.technicianId === currentUser.id;
const canManage = isSupervisor || isOwner;
const techType = getTechType(entry.technicianId);
const isChimney = techType === 'فني مدخنة';

return (
<TableRow key={entry.id} className={isOwner ? "bg-primary/5" : ""}>
<TableCell className="font-black">{entry.date}</TableCell>
<TableCell>
<div className="flex flex-col">
<span className="font-black text-primary">{getTechName(entry.technicianId)}</span>
{isOwner && <span className="text-[10px] text-emerald-600 font-bold uppercase">(سجلك الخاص)</span>}
</div>
</TableCell>
<TableCell>
<Badge variant="outline" className={isChimney ? "border-blue-500 text-blue-600" : "border-emerald-500 text-emerald-600"}>
{techType}
</Badge>
</TableCell>
<TableCell className="font-bold">{entry.gasStoveConversions + entry.waterHeaterConversions + entry.householdApplianceReplacements}</TableCell>
<TableCell className="font-bold">{entry.commercialApplianceReplacements + entry.commercialApplianceConversions}</TableCell>
<TableCell className="font-bold">{entry.chimneyInstallations}</TableCell>
<TableCell className="text-left">
{canManage && (
<div className="flex items-center justify-end gap-2">
<Button variant="ghost" size="icon" onClick={() => handleEdit(entry)} className="text-primary hover:bg-primary/10 h-9 w-9">
<Edit2 className="h-4 w-4" />
</Button>
<Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)} className="text-destructive hover:bg-destructive/10 h-9 w-9">
<Trash2 className="h-4 w-4" />
</Button>
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
