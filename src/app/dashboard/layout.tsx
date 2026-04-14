"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import { NavBar } from "@/components/nav-bar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("current_user");
    if (!stored) {
      router.push("/");
    } else {
      setUser(JSON.parse(stored));
    }
  }, [router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background font-body" dir="rtl">
      <NavBar user={user} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}