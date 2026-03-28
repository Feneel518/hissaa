import DashboardNavbar from "@/components/navbar/DashboardNavbar";

import { requireUser } from "@/lib/checks/auth/RequireUser";
import { ensurePersonalGroup } from "@/lib/helpers/personal/ensure-personal-group";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  await ensurePersonalGroup();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardNavbar
        user={{
          name: user.name,
          email: user.email,
          image: user.image,
        }}
        addExpenseHref="/expenses/new"
      />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
