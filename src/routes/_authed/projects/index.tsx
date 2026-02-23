import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { FolderKanban, Plus } from "lucide-react";
import { Header } from "../../../components/Header";
import { ProjectCard } from "../../../components/ProjectCard";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Button } from "../../../components/ui/Button";
import { Skeleton } from "../../../components/ui/Skeleton";

export const Route = createFileRoute("/_authed/projects/")({
  component: ProjectsPage,
});

function ProjectsPage() {
  // const projects = useQuery(api.projects.list);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projects = undefined as any[] | undefined; // placeholder until backend

  return (
    <div>
      <Header
        title="Projects"
        actions={
          <Link to="/projects/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        }
      />
      <div className="p-6">
        {projects === undefined ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create your first project to start tracking punch items."
            action={
              <Link to="/projects/new">
                <Button>
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project: any) => (
              <ProjectCard
                key={project._id}
                id={project._id}
                name={project.name}
                address={project.address}
                status={project.status}
                totalItems={project.totalItems ?? 0}
                completedItems={project.completedItems ?? 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
