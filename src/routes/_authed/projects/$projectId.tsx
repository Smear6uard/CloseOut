import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "convex/react";
import { Plus, ClipboardList } from "lucide-react";
import { Header } from "../../../components/Header";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Skeleton } from "../../../components/ui/Skeleton";
import { EmptyState } from "../../../components/ui/EmptyState";
import { PunchItemRow } from "../../../components/PunchItemRow";
import { FilterBar, type FilterValues } from "../../../components/FilterBar";
import { PunchItemForm } from "../../../components/PunchItemForm";
import type { ItemStatus, Priority, Trade } from "../../../lib/constants";

type SearchParams = {
  status?: string;
  priority?: string;
  trade?: string;
  search?: string;
};

export const Route = createFileRoute("/_authed/projects/$projectId")({
  component: ProjectDetailPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    status: (search.status as string) || undefined,
    priority: (search.priority as string) || undefined,
    trade: (search.trade as string) || undefined,
    search: (search.search as string) || undefined,
  }),
});

function ProjectDetailPage() {
  const { projectId } = Route.useParams();
  const filters = Route.useSearch();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  // const project = useQuery(api.projects.get, { id: projectId });
  // const items = useQuery(api.punchItems.list, { projectId, ...filters });

  const updateFilters = (newFilters: FilterValues) => {
    navigate({
      search: newFilters as any,
      replace: true,
    });
  };

  const handleCreateItem = (data: any) => {
    // await createItem({ projectId, ...data });
    setShowForm(false);
  };

  // Placeholder: show loading state until backend exists
  const project = undefined as any;
  const items = undefined as any[] | undefined;

  return (
    <div>
      <Header
        title={project?.name || "Project"}
        actions={
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        }
      />
      <div className="space-y-4 p-6">
        {/* Filters */}
        <FilterBar filters={filters} onChange={updateFilters} />

        {/* Punch Items List */}
        <Card padding={false}>
          {items === undefined ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No punch items"
              description={
                Object.values(filters).some(Boolean)
                  ? "No items match your filters. Try adjusting them."
                  : "Add your first punch item to this project."
              }
              action={
                !Object.values(filters).some(Boolean) ? (
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                ) : undefined
              }
            />
          ) : (
            items.map((item: any) => (
              <PunchItemRow
                key={item._id}
                id={item._id}
                title={item.title}
                status={item.status as ItemStatus}
                priority={item.priority as Priority}
                trade={item.trade as Trade}
                location={item.location}
                assignedTo={item.assignedTo}
                dueDate={item.dueDate}
                createdAt={item.createdAt}
              />
            ))
          )}
        </Card>
      </div>

      {/* Create Item Modal */}
      <PunchItemForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreateItem}
      />
    </div>
  );
}
