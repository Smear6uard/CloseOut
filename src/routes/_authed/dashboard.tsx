import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import {
  ClipboardList,
  FolderKanban,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Header } from "../../components/Header";
import { StatsCard } from "../../components/StatsCard";
import { Card } from "../../components/ui/Card";
import { PunchItemRow } from "../../components/PunchItemRow";
import { ProjectCard } from "../../components/ProjectCard";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import type { ItemStatus, Priority, Trade } from "../../lib/constants";

export const Route = createFileRoute("/_authed/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  // These will resolve once Agent 1's backend is deployed
  // const projects = useQuery(api.projects.list);
  // const recentItems = useQuery(api.punchItems.listRecent);

  // Placeholder data for development
  const stats = [
    { icon: FolderKanban, label: "Active Projects", value: 4 },
    { icon: ClipboardList, label: "Open Items", value: 23 },
    { icon: AlertTriangle, label: "Critical", value: 3 },
    { icon: CheckCircle2, label: "Completed This Week", value: 12 },
  ];

  return (
    <div>
      <Header title="Dashboard" />
      <div className="space-y-6 p-6">
        {/* Stats Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatsCard
              key={stat.label}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Items */}
          <Card padding={false}>
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Recent Punch Items</h2>
            </div>
            <div className="divide-y divide-slate-100">
              <EmptyState
                icon={ClipboardList}
                title="No items yet"
                description="Punch items from your projects will appear here."
              />
            </div>
          </Card>

          {/* Project Overview */}
          <Card padding={false}>
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Projects</h2>
            </div>
            <div className="p-4">
              <EmptyState
                icon={FolderKanban}
                title="No projects yet"
                description="Create your first project to get started."
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
