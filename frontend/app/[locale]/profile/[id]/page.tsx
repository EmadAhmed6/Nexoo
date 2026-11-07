"use client";

import { useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

function DynamicProfileRedirect() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const locale = params?.locale as string;

  useEffect(() => {
    if (id) {
      const target = locale ? `/${locale}/profile?userId=${id}` : `/profile?userId=${id}`;
      router.replace(target);
    }
  }, [id, locale, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

export default function DynamicProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <DynamicProfileRedirect />
    </Suspense>
  );
}

