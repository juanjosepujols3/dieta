"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Barcode,
  Camera,
  CalendarCheck,
  CheckCircle2,
  LayoutDashboard,
  Shield,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

type ShellUser = {
  name?: string | null;
  email?: string | null;
  role: "SUPERADMIN" | "USER";
};

const navItems = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/plan", label: "Plan mensual", icon: CalendarCheck },
  { href: "/app/day", label: "Check diario", icon: CheckCircle2 },
  { href: "/app/scan", label: "Food Scan", icon: Camera },
  { href: "/app/barcode", label: "Barcode", icon: Barcode },
];

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: ShellUser;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="font-display text-lg font-semibold">DietCraft</p>
            <p className="text-xs text-muted-foreground">
              Bienvenido{user.name ? `, ${user.name}` : ""}
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-6 md:grid-cols-[220px_1fr]">
        <aside className="space-y-2">
          <div className="rounded-3xl border border-border/60 bg-background p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Navegacion
            </p>
            <nav className="mt-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              {user.role === "SUPERADMIN" && (
                <Link
                  href="/admin"
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition",
                    pathname.startsWith("/admin")
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
            </nav>
          </div>
        </aside>

        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
