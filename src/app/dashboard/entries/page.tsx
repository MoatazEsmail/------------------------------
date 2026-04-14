"use client";

import { useState, useEffect } from "react";
import { User, ProductivityEntry, TECHNICIANS } from "@/lib/types";
import { getEntries, saveEntry, deleteEntry } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit2, Calendar as CalendarIcon, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

export default function EntriesPage() {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<ProductivityEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
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
    if (stored) setCurrentUser(JSON.parse(stored));
    setEntries(getEntries());
  }, []);

  if (!currentUser) return null;

  const userEntries = entries
    .filter(e => currentUser.role === 'supervisor' ? true : e.technicianId === currentUser.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEntry: ProductivityEntry = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      technicianId: currentUser.id,
      ...formData
    };

    saveEntry(newEntry);
    setEntries(getEntries());
    setEditingId(null);
    setFormData({
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
    deleteEntry(id);
    setEntries(getEntries());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-headline">تسجيل الإنتاجية اليومية</h2>
      </div>

      <Card className="shadow-md border-primary/20">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-lg">إضافة سجل جديد</CardTitle>
          <CardDescription>أدخل تفاصيل الأجهزة التي تم العمل عليها اليوم</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label htmlFor="date">التاريخ</Label>
              <Input 
                id="date" 
                type="date" 
                value={formData.date} 
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gas">تحويل بوتجاز</Label>
              <Input id="gas" type="number" min="0" value={formData.gasStoveConversions} onChange={(e) => setFormData({...formData, gasStoveConversions: parseInt(e.target.value) || 0})} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="heater">تحويل سخان</Label>
              <Input id="heater" type="number" min="0" value={formData.waterHeaterConversions} onChange={(e) => setFormData({...formData, waterHeaterConversions: parseInt(e.target.value) || 0})} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="house_rep">استبدال أجهزة منزلية</Label>
              <Input id="house_rep" type="number" min="0" value={formData.householdApplianceReplacements} onChange={(e) => setFormData({...formData, householdApplianceReplacements: parseInt(e.target.value) || 0})} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="comm_rep">استبدال أجهزة تجارية</Label>
              <Input id="comm_rep" type="number" min="0" value={formData.commercialApplianceReplacements} onChange={(e) => setFormData({...formData, commercialApplianceReplacements: parseInt(e.target.value) || 0})} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="comm_conv">تحويل أجهزة تجارية</Label>
              <Input id="comm_conv" type="number" min="0" value={formData.commercialApplianceConversions} onChange={(e) => setFormData({...formData, commercialApplianceConversions: parseInt(e.target.value) || 0})} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="chimney">تركيب مداخن</Label>
              <Input id="chimney" type="number" min="0" value={formData.chimneyInstallations} onChange={(e) => setFormData({...formData, chimneyInstallations: parseInt(e.target.value) || 0})} />
            </div>

            <div className="col-span-1 md:col-span-2 flex gap-3 pt-4">
              <Button type="submit" className="flex-1 gap-2">
                {editingId ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingId ? "تحديث البيانات" : "حفظ الإنتاجية"}
              </Button>
              {editingId && (
                <Button variant="outline" type="button" onClick={() => setEditingId(null)}>
                  إلغاء
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-bold font-headline">سجلاتك السابقة</h3>
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>منزلي (تحويل/استبدال)</TableHead>
                <TableHead>تجاري</TableHead>
                <TableHead>مداخن</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    لا توجد سجلات بعد
                  </TableCell>
                </TableRow>
              ) : (
                userEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.date}</TableCell>
                    <TableCell>{entry.gasStoveConversions + entry.waterHeaterConversions + entry.householdApplianceReplacements}</TableCell>
                    <TableCell>{entry.commercialApplianceReplacements + entry.commercialApplianceConversions}</TableCell>
                    <TableCell>{entry.chimneyInstallations}</TableCell>
                    <TableCell className="text-left">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)} className="text-primary hover:bg-primary/10">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)} className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
  );
}
