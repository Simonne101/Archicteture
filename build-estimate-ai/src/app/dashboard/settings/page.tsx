import { redirect } from "next/navigation";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { getCurrentUser } from "@/lib/queries";

export default async function UserSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [firstname = "", ...rest] = user.name.split(" ");
  const lastname = rest.join(" ");

  return (
    <div className="flex flex-1 flex-col">
      <DashboardTopbar title="Paramètres" />
      <div className="flex flex-1 justify-center p-4 sm:p-6">
        <ProfileForm
          firstname={firstname}
          lastname={lastname}
          email={user.email}
          role={user.role}
          company={user.company ?? ""}
          avatarUrl={user.avatarUrl}
          notifyEmail={user.notifyEmail}
          notifyAnalysisDone={user.notifyAnalysisDone}
        />
      </div>
    </div>
  );
}
