
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TECHNICIANS, SUPERVISOR, User } from "@/lib/types";
import { Lock, User as UserIcon, Flame, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedUser = localStorage.getItem("current_user");
    if (storedUser) {
      router.push("/dashboard");
    }
  }, [router]);

  if (!isMounted) return null;

  const normalizeArabic = (text: string) => {
    return text
      .trim()
      .replace(/[أإآ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/\s+/g, " ");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const allUsers: User[] = [SUPERVISOR, ...TECHNICIANS];
    
    // Normalize input and stored names for a more flexible match
    const normalizedInputName = normalizeArabic(username);
    
    const user = allUsers.find((u) => {
      const normalizedStoreName = normalizeArabic(u.name);
      return normalizedStoreName === normalizedInputName && u.password === password.trim();
    });

    if (user) {
      localStorage.setItem("current_user", JSON.stringify(user));
      // Use window.location for a hard redirect to refresh the layout state
      window.location.href = "/dashboard";
    } else {
      setError("خطأ في اسم المستخدم أو كلمة المرور. يرجى التأكد من كتابة الاسم كما هو مسجل.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 rtl" dir="rtl">
      <Card className="w-full max-w-md shadow-2xl border-t-8 border-primary overflow-hidden">
        <CardHeader className="text-center space-y-4 pb-8 bg-white">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center shadow-inner">
            <Flame className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-4xl font-black font-headline text-primary tracking-tighter">تاون جاس</CardTitle>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-foreground">منطقة مصر الجديدة</span>
              <span className="text-sm font-bold text-muted-foreground bg-secondary/50 px-3 py-0.5 rounded-full mt-1">إدارة العمليات</span>
            </div>
          </div>
          <CardDescription className="text-sm font-medium border-b pb-4">
            نظام تتبع الإنتاجية اليومية للتحويلات والمداخن
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 bg-white">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-bold pr-1">اسم المستخدم</Label>
              <div className="relative">
                <UserIcon className="absolute right-3 top-3 h-5 w-5 text-muted-foreground/60" />
                <Input
                  id="username"
                  className="pr-10 h-12 border-2 focus-visible:ring-primary"
                  placeholder="أدخل اسمك بالكامل"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-bold pr-1">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground/60" />
                <Input
                  id="password"
                  type="password"
                  className="pr-10 h-12 border-2 focus-visible:ring-primary"
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs font-bold">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full h-14 text-xl font-black shadow-lg shadow-primary/20 transition-all active:scale-95"
              disabled={isLoading}
            >
              {isLoading ? "جاري التحقق..." : "تسجيل الدخول"}
            </Button>
            
            <div className="pt-4 text-center">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">جميع الحقوق محفوظة لشركة تاون جاس &copy; ٢٠٢٤</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
