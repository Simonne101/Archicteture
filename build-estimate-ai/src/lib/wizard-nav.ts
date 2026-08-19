import { Project, ProjectStatus } from "./types";

const NEXT_STEP_BY_STATUS: Record<ProjectStatus, string> = {
  brouillon: "import",
  plan_importe: "analysis",
  analyse: "verification",
  verifie: "settings",
  calcule: "results",
};

export function wizardHrefForProject(project: Project) {
  return `/dashboard/projects/${project.id}/${NEXT_STEP_BY_STATUS[project.status]}`;
}
