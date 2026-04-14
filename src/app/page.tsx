
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

  /**
   * دالة تنظيف النص العربي لضمان مطابقة الأسماء بغض النظر عن طريقة الكتابة
   */
  const normalizeArabic = (text: string) => {
    if (!text) return "";
    return text
      .trim()
      .replace(/[\u064B-\u0652]/g, "") // إزالة التشكيل
      .replace(/[أإآ]/g, "ا") // توحيد الألف
      .replace(/ة/g, "ه") // توحيد التاء المربوطة والهاء (شائع في الأخطاء الإملائية)
      .replace(/ى/g, "ي") // توحيد الياء والألف اللينة
      .replace(/\s+/g, " "); // توحيد المسافات المتعددة لمسافة واحدة
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const allUsers: User[] = [SUPERVISOR, ...TECHNICIANS];
    const normalizedInputName = normalizeArabic(username);
    const inputPassword = password.trim();

    // البحث عن المستخدم بمطابقة الاسم المنظف وكلمة المرور
    const user = allUsers.find((u) => {
      const normalizedStoreName = normalizeArabic(u.name);
      return normalizedStoreName === normalizedInputName && u.password === inputPassword;
    });

    if (user) {
      // حفظ بيانات المستخدم في LocalStorage
      localStorage.setItem("current_user", JSON.stringify(user));
      // توجيه المستخدم للوحة التحكم
      window.location.href = "/dashboard";
    } else {
      setError("بيانات الدخول غير صحيحة. يرجى التأكد من كتابة الاسم وكلمة المرور بشكل صحيح.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 rtl" dir="rtl">
      <Card className="w-full max-w-md shadow-2xl border-t-8 border-primary overflow-hidden bg-white">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center shadow-inner border border-primary/20">
            <Flame className="w-12 h-12 text-primary animate-pulse" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-4xl font-black font-headline text-primary tracking-tighter">تاون جاس</CardTitle>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-slate-800">منطقة مصر الجديدة</span>
              <span className="text-sm font-bold text-muted-foreground bg-secondary/80 px-4 py-1 rounded-full mt-2">إدارة العمليات</span>
            </div>
          </div>
          <CardDescription className="text-sm font-medium border-b border-dashed pb-4 mt-4">
            نظام تتبع الإنتاجية اليومية للتحويلات والمداخن
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-black pr-1 text-slate-700">الاسم بالكامل</Label>
              <div className="relative">
                <UserIcon className="absolute right-3 top-3.5 h-5 w-5 text-muted-foreground/60" />
                <Input
                  id="username"
                  className="pr-10 h-12 border-2 focus-visible:ring-primary bg-slate-50 font-bold"
                  placeholder="مثال: معتز اسماعيل"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-black pr-1 text-slate-700">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3.5 h-5 w-5 text-muted-foreground/60" />
                <Input
                  id="password"
                  type="password"
                  className="pr-10 h-12 border-2 focus-visible:ring-primary bg-slate-50"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive" className="py-3 border-2 animate-bounce">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="text-sm font-bold">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full h-14 text-xl font-black shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
              disabled={isLoading}
            >
              {isLoading ? "جاري التحقق..." : "تسجيل الدخول"}
            </Button>
            
            <div className="pt-6 text-center border-t border-slate-100">
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-loose">
                جميع الحقوق محفوظة لشركة تاون جاس &copy; ٢٠٢٤<br/>
                إدارة العمليات - منطقة مصر الجديدة
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
