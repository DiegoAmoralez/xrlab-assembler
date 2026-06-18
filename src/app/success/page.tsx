"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { PublicHeader } from "@/components/PublicHeader";

const SuccessContent = () => {
  const searchParams = useSearchParams();
  const taskNumber = searchParams.get("number");

  return (
  <main className="flex min-h-[calc(100vh-65px)] items-center py-12">
    <div className="container-app text-center">
      <div className="card mx-auto max-w-md">
        <div className="mb-4 text-5xl" aria-hidden="true">
          ✓
        </div>
        <h1 className="mb-2 text-2xl font-bold text-text">Заявка отправлена</h1>

        {taskNumber && (
          <p className="mb-4">
            <span className="text-text-muted">Номер заявки: </span>
            <span className="font-mono-app text-xl font-bold text-accent">
              {taskNumber}
            </span>
          </p>
        )}

        <p className="mb-6 text-text-muted">
          Заявка принята. Если нужно что-то уточнить, с вами свяжутся.
        </p>

        <Link href="/" className="btn-secondary">
          Отправить ещё одну заявку
        </Link>
      </div>
    </div>
  </main>
  );
};

const SuccessPage = () => {
  return (
    <>
      <PublicHeader showLogin={false} />
      <Suspense fallback={<div className="container-app py-12 text-center">Загрузка...</div>}>
        <SuccessContent />
      </Suspense>
    </>
  );
};

export default SuccessPage;
