import { useState, type FormEvent } from "react";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Button } from "./ui/Button";
import { PRIORITIES, TRADES } from "../lib/constants";

interface PunchItemFormData {
  title: string;
  description: string;
  priority: string;
  trade: string;
  location: string;
  assignedTo: string;
  dueDate: string;
}

interface PunchItemFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PunchItemFormData) => void;
  initialData?: Partial<PunchItemFormData>;
  isEditing?: boolean;
}

const emptyForm: PunchItemFormData = {
  title: "",
  description: "",
  priority: "medium",
  trade: "General",
  location: "",
  assignedTo: "",
  dueDate: "",
};

export function PunchItemForm({
  open,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}: PunchItemFormProps) {
  const [form, setForm] = useState<PunchItemFormData>({
    ...emptyForm,
    ...initialData,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
    if (!isEditing) setForm(emptyForm);
    onClose();
  };

  const update = (field: keyof PunchItemFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Punch Item" : "New Punch Item"}
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          placeholder="e.g., Cracked tile in lobby"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          required
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            rows={3}
            placeholder="Describe the issue..."
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priority"
            options={PRIORITIES.map((p) => ({
              value: p,
              label: p.charAt(0).toUpperCase() + p.slice(1),
            }))}
            value={form.priority}
            onChange={(e) => update("priority", e.target.value)}
          />
          <Select
            label="Trade"
            options={TRADES.map((t) => ({ value: t, label: t }))}
            value={form.trade}
            onChange={(e) => update("trade", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Location"
            placeholder="e.g., Floor 2, Room 201"
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
          />
          <Input
            label="Assigned To"
            placeholder="e.g., John Smith"
            value={form.assignedTo}
            onChange={(e) => update("assignedTo", e.target.value)}
          />
        </div>
        <Input
          label="Due Date"
          type="date"
          value={form.dueDate}
          onChange={(e) => update("dueDate", e.target.value)}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? "Save Changes" : "Create Item"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
