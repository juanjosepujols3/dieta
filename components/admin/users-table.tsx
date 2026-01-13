"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: "SUPERADMIN" | "USER";
  entitlement: "FREE" | "PAID" | "COMPED";
  accessWeeks: number;
};

export function UsersTable({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const updateEntitlement = (userId: string, entitlement: "FREE" | "COMPED") => {
    startTransition(async () => {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, entitlement }),
      });
      router.refresh();
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Entitlement</TableHead>
          <TableHead>Access Weeks</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name ?? "-"}</TableCell>
            <TableCell>{user.email ?? "-"}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>{user.entitlement}</TableCell>
            <TableCell>{user.accessWeeks}</TableCell>
            <TableCell className="space-x-2">
              <Button
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() => updateEntitlement(user.id, "COMPED")}
              >
                Promover a pago
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={isPending}
                onClick={() => updateEntitlement(user.id, "FREE")}
              >
                Revertir a gratis
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
