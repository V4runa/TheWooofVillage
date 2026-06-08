"use client";

import { DogsPanel } from "@/components/admin/DogPanel";

export default function AdminDogsPage() {
  return (
    <div className="flex flex-1 flex-col lg:min-h-0 lg:overflow-hidden">
      <DogsPanel />
    </div>
  );
}
