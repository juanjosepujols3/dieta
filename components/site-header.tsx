"use client";

import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/75 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-glow" />
          <div>
            <p className="font-display text-lg font-semibold">DietCraft</p>
            <p className="text-xs text-muted-foreground">Plan. Track. Evolve.</p>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <a className="text-muted-foreground hover:text-foreground" href="#como-funciona">
            Como funciona
          </a>
          <a className="text-muted-foreground hover:text-foreground" href="#beneficios">
            Beneficios
          </a>
          <a className="text-muted-foreground hover:text-foreground" href="#planes">
            Planes
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button asChild size="sm" className="rounded-full">
            <Link href="/auth/login">Entrar</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
