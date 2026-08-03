"use client";

import { useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal";

export default function AuthPageClient({ error, returnTo }: { error: string; returnTo: string }) {
  const router = useRouter();

  return <LoginModal initialError={error} onClose={() => router.push(returnTo)} returnTo={returnTo} />;
}
