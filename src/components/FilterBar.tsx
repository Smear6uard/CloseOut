import { Select } from "./ui/Select";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Search, X } from "lucide-react";
import { ITEM_STATUSES, PRIORITIES, TRADES } from "../lib/constants";

export interface FilterValues {
  status?: string;
  priority?: string;
  trade?: string;
  search?: string;
}

interface FilterBarProps {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const hasFilters = filters.status || filters.priority || filters.trade || filters.search;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search items..."
          value={filters.search || ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
          className="pl-9"
        />
      </div>
      <Select
        options={[
          { value: "", label: "All Statuses" },
          ...ITEM_STATUSES.map((s) => ({ value: s, label: s.replace("_", " ") })),
        ]}
        value={filters.status || ""}
        onChange={(e) => onChange({ ...filters, status: e.target.value || undefined })}
      />
      <Select
        options={[
          { value: "", label: "All Priorities" },
          ...PRIORITIES.map((p) => ({ value: p, label: p })),
        ]}
        value={filters.priority || ""}
        onChange={(e) => onChange({ ...filters, priority: e.target.value || undefined })}
      />
      <Select
        options={[
          { value: "", label: "All Trades" },
          ...TRADES.map((t) => ({ value: t, label: t })),
        ]}
        value={filters.trade || ""}
        onChange={(e) => onChange({ ...filters, trade: e.target.value || undefined })}
      />
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({})}
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
