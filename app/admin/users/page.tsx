import { UsersTable } from "@/components/admin/users-table";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      entitlement: true,
      accessWeeks: true,
    },
  });

  return (
    <Card className="border-border/60 bg-background p-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Usuarios</p>
        <h1 className="font-display text-2xl font-semibold">Gestion de usuarios</h1>
      </div>
      <div className="mt-6">
        <UsersTable users={users} />
      </div>
    </Card>
  );
}
