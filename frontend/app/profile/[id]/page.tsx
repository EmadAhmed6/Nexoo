"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DynamicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      router.replace(`/profile?userId=${id}`);
    }
  }, [id, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
