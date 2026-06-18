import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { DashboardClient } from "@/components/DashboardClient";

const DashboardPage = async () => {
  const session = await requireAuth();
  if (!session) {
    redirect("/login");
  }

  return <DashboardClient email={session.email ?? ""} />;
};

export default DashboardPage;
