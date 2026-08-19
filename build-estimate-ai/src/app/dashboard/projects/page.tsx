import { getProjects } from "@/lib/queries";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { ProjectsTable } from "@/components/dashboard/projects-table";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="flex flex-1 flex-col">
      <DashboardTopbar title="Mes projets" />
      <ProjectsTable projects={projects} />
    </div>
  );
}
