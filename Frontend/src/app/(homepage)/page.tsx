"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/route";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Dev Frontend</h1>
      <p className="mt-2 text-neutral-600">
        Next.js App Router template is ready.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          className="rounded-lg bg-black px-4 py-2 text-white"
          onClick={() => router.push(ROUTES.DASHBOARD.HOME)}
        >
          Go to Dashboard
        </button>
      </div>
    </main>
  );
}
