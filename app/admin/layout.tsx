// app/admin/layout.tsx
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: "Admin • WoofVillage",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  // AdminShell is a client component (it handles sidebar nav, session UI, etc.)
  // Layout can remain a server component and wrap it.
  return <AdminShell>{children}</AdminShell>;
}
