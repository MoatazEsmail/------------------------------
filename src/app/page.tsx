"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TECHNICIANS, SUPERVISOR, User } from "@/lib/types";
import { Lock, User as UserIcon, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedUser = localStorage.getItem("current_user");
    if (storedUser) {
      router.push("/dashboard");
    }
  }, [router]);

  if (!isMounted) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const allUsers: User[] = [SUPERVISOR, ...TECHNICIANS];
    const user = allUsers.find((u) => u.name === username && u.password === password);

    if (user) {
      localStorage.setItem("current_user", JSON.stringify(user));
      router.push("/dashboard");
    } else {
      setError("خطأ في اسم المستخدم أو كلمة المرور");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background rtl" dir="rtl">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-primary">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold font-headline">انتاجية قسم التحويلات والمداخن</CardTitle>
          <CardDescription>نظام تتبع الإنتاجية اليومية للفنيين</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <div className="relative">
                <UserIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  className="pr-10"
                  placeholder="أدخل اسمك"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pr-10"
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            {error && <p className="text-destructive text-sm font-medium">{error}</p>}
            <Button type="submit" className="w-full h-12 text-lg font-medium">
              تسجيل الدخول
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}