"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const authSchema = z.object({
  name: z.string().min(2, "Nombre requerido").optional(),
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "Minimo 6 caracteres"),
});

type AuthValues = z.infer<typeof authSchema>;

export function AuthForm({ enableGoogle = true }: { enableGoogle?: boolean }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/app";

  const form = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: AuthValues) => {
    setError(null);
    startTransition(async () => {
      if (mode === "register") {
        if (!values.name?.trim()) {
          form.setError("name", { type: "manual", message: "Nombre requerido" });
          return;
        }
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error ?? "No pudimos crear tu cuenta.");
          return;
        }
      }

      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
        callbackUrl,
      });

      if (result?.error) {
        setError("Credenciales invalidas.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {enableGoogle && (
        <>
          <Button
            variant="outline"
            className="w-full rounded-full"
            onClick={() => signIn("google", { callbackUrl })}
            disabled={isPending}
          >
            Continuar con Google
          </Button>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            o con email
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {mode === "register" && (
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" placeholder="Tu nombre" {...form.register("name")} />
            {form.formState.errors.name?.message && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="tu@email.com" {...form.register("email")} />
          {form.formState.errors.email?.message && (
            <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="******"
            {...form.register("password")}
          />
          {form.formState.errors.password?.message && (
            <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <Button type="submit" className="w-full rounded-full" disabled={isPending}>
          {mode === "login" ? "Entrar" : "Crear cuenta"}
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        {mode === "login" ? "No tienes cuenta?" : "Ya tienes cuenta?"}{" "}
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="font-semibold text-emerald-600 hover:text-emerald-500"
        >
          {mode === "login" ? "Crear cuenta" : "Iniciar sesion"}
        </button>
      </div>
    </div>
  );
}
