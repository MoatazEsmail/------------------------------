"use client";

import { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut, Home, BarChart2, PlusCircle, Settings } from "lucide-react";

export function NavBar({ user }: { user: User }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("current_user");
    router.push("/");
  };

  return (
    <nav className="border-b bg-card px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-50 rtl" dir="rtl">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-bold text-primary font-headline hidden md:block">
          انتاجية القسم
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="gap-2">
            <Home className="h-4 w-4" />
            <span>الرئيسية</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/entries")} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>تسجيل الإنتاجية</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-left hidden sm:block">
          <p className="text-sm font-bold text-foreground leading-none">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.role === 'supervisor' ? 'المشرف العام' : user.type}</p>
        </div>
        <Button variant="outline" size="icon" onClick={handleLogout} title="تسجيل الخروج" className="text-destructive hover:bg-destructive/10">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}