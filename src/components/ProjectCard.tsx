import { Link } from "@tanstack/react-router";
import { MapPin, ClipboardList } from "lucide-react";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { ProgressBar } from "./ui/ProgressBar";
import { completionPercentage } from "../lib/utils";

interface ProjectCardProps {
  id: string;
  name: string;
  address?: string;
  status: string;
  totalItems: number;
  completedItems: number;
}

export function ProjectCard({
  id,
  name,
  address,
  status,
  totalItems,
  completedItems,
}: ProjectCardProps) {
  const pct = completionPercentage(completedItems, totalItems);
  const statusColor = status === "active" ? "green" : status === "completed" ? "blue" : "gray";

  return (
    <Link to="/projects/$projectId" params={{ projectId: id }}>
      <Card className="transition-shadow hover:shadow-md">
        <div className="mb-3 flex items-start justify-between">
          <h3 className="font-semibold text-slate-900">{name}</h3>
          <Badge color={statusColor}>{status}</Badge>
        </div>
        {address && (
          <p className="mb-3 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            {address}
          </p>
        )}
        <div className="mb-2 flex items-center gap-1.5 text-sm text-slate-500">
          <ClipboardList className="h-3.5 w-3.5" />
          {completedItems} / {totalItems} items
        </div>
        <ProgressBar value={pct} color={pct === 100 ? "green" : "blue"} />
      </Card>
    </Link>
  );
}
