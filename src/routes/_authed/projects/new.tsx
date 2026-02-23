import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Header } from "../../../components/Header";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";

export const Route = createFileRoute("/_authed/projects/new")({
  component: NewProjectPage,
});

function NewProjectPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  // const createProject = useMutation(api.projects.create);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // await createProject({ name, address, description });
    navigate({ to: "/projects" });
  };

  return (
    <div>
      <Header title="New Project" />
      <div className="mx-auto max-w-xl p-6">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Project Name"
              placeholder="e.g., Sunrise Tower Phase 2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Address"
              placeholder="e.g., 123 Main St, Springfield"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                rows={3}
                placeholder="Optional project description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => navigate({ to: "/projects" })}
              >
                Cancel
              </Button>
              <Button type="submit">Create Project</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
