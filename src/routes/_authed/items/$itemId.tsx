import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "convex/react";
import {
  ArrowLeft,
  Camera,
  Sparkles,
  Clock,
  MapPin,
  User,
  Tag,
} from "lucide-react";
import { Header } from "../../../components/Header";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Skeleton } from "../../../components/ui/Skeleton";
import { StatusBadge } from "../../../components/StatusBadge";
import { PriorityDot } from "../../../components/PriorityDot";
import { TradeBadge } from "../../../components/TradeBadge";
import { PhotoUpload } from "../../../components/PhotoUpload";
import { PhotoDisplay } from "../../../components/PhotoDisplay";
import { ActivityEntry } from "../../../components/ActivityEntry";
import { VALID_STATUS_TRANSITIONS } from "../../../lib/constants";
import { formatDate } from "../../../lib/utils";
import type { ItemStatus } from "../../../lib/constants";

export const Route = createFileRoute("/_authed/items/$itemId")({
  component: ItemDetailPage,
});

function ItemDetailPage() {
  const { itemId } = Route.useParams();

  // const item = useQuery(api.punchItems.get, { id: itemId });
  // const activities = useQuery(api.activityLog.list, { punchItemId: itemId });

  // Placeholder until backend
  const item = undefined as any;
  const activities = undefined as any[] | undefined;

  if (item === undefined) {
    return (
      <div>
        <Header title="Punch Item" />
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  const validTransitions = VALID_STATUS_TRANSITIONS[item?.status as ItemStatus] || [];

  return (
    <div>
      <Header
        title={item?.title || "Punch Item"}
        actions={
          <Link to="/projects/$projectId" params={{ projectId: item?.projectId }}>
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Project
            </Button>
          </Link>
        }
      />
      <div className="space-y-6 p-6">
        {/* Status & Metadata Row */}
        <Card>
          <div className="flex flex-wrap items-center gap-4">
            <StatusBadge status={item.status} />
            <PriorityDot priority={item.priority} showLabel />
            <TradeBadge trade={item.trade} />
            {item.location && (
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                {item.location}
              </span>
            )}
            {item.assignedTo && (
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                <User className="h-3.5 w-3.5" />
                {item.assignedTo}
              </span>
            )}
            {item.dueDate && (
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                <Clock className="h-3.5 w-3.5" />
                Due {formatDate(item.dueDate)}
              </span>
            )}
          </div>
          {item.description && (
            <p className="mt-4 text-sm text-slate-600">{item.description}</p>
          )}

          {/* Status Transitions */}
          {validTransitions.length > 0 && (
            <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
              <span className="text-sm text-slate-500">Move to:</span>
              {validTransitions.map((status: ItemStatus) => (
                <Button
                  key={status}
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    // await updateStatus({ id: itemId, status });
                  }}
                >
                  {status.replace("_", " ")}
                </Button>
              ))}
            </div>
          )}
        </Card>

        {/* Photos */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
              <Camera className="h-4 w-4" />
              Defect Photo
            </h3>
            {item.defectPhotoUrl ? (
              <PhotoDisplay url={item.defectPhotoUrl} alt="Defect photo" />
            ) : (
              <PhotoUpload
                label=""
                onUpload={(file) => {
                  // Upload defect photo via Convex storage
                }}
              />
            )}
          </Card>

          <Card>
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
              <Camera className="h-4 w-4" />
              Completion Photo
            </h3>
            {item.completionPhotoUrl ? (
              <PhotoDisplay url={item.completionPhotoUrl} alt="Completion photo" />
            ) : (
              <PhotoUpload
                label=""
                onUpload={(file) => {
                  // Upload completion photo via Convex storage
                }}
              />
            )}
          </Card>
        </div>

        {/* AI Analysis */}
        {(item.aiTags || item.aiComparisonResult) && (
          <Card>
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
              <Sparkles className="h-4 w-4 text-brand-500" />
              AI Analysis
            </h3>
            {item.aiTags && item.aiTags.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-sm font-medium text-slate-700">
                  Detected Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.aiTags.map((tag: string) => (
                    <Badge key={tag} color="blue">
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {item.aiComparisonResult && (
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">
                  Before/After Comparison
                </p>
                <div
                  className={`rounded-lg p-4 ${
                    item.aiComparisonResult.match
                      ? "bg-green-50 text-green-800"
                      : "bg-amber-50 text-amber-800"
                  }`}
                >
                  <p className="text-sm font-medium">
                    {item.aiComparisonResult.match ? "Fix Verified" : "Fix Not Verified"}
                    {" "}
                    ({Math.round(item.aiComparisonResult.confidence * 100)}% confidence)
                  </p>
                  <p className="mt-1 text-sm">{item.aiComparisonResult.summary}</p>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Activity Log */}
        <Card>
          <h3 className="mb-4 font-semibold text-slate-900">Activity</h3>
          {activities === undefined ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <p className="text-sm text-slate-500">No activity yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {activities.map((activity: any) => (
                <ActivityEntry
                  key={activity._id}
                  action={activity.action}
                  details={activity.details}
                  userName={activity.userName}
                  createdAt={activity.createdAt}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
