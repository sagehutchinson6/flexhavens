import { useState } from "react";
import { Layers, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { formatCurrency } from "@/hooks/use-investor";
import { parsePlanFeatures } from "@/lib/investment-plans";
import { SectionCard, StatusBadge } from "../dashboard/shared";

const emptyPlan = {
  id: undefined as number | undefined,
  name: "",
  minAmount: "",
  targetReturn: "",
  durationMonths: "",
  featured: "no" as "yes" | "no",
  description: "",
  featuresText: "",
  isActive: "yes" as "yes" | "no",
  sortOrder: 0,
};

const emptyProject = {
  id: undefined as number | undefined,
  name: "",
  location: "",
  category: "",
  description: "",
  image: "",
  targetAmount: "",
  expectedReturn: "",
  durationMonths: "",
  status: "open" as "open" | "funding" | "funded" | "completed",
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-[#1e3a5f] font-serif mb-5">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export default function AdminPlansProjects() {
  const { data: plans, refetch: refetchPlans } = trpc.investAdmin.plans.useQuery(undefined, { retry: false, refetchInterval: 20_000 });
  const { data: projects, refetch: refetchProjects } = trpc.investAdmin.projects.useQuery(undefined, { retry: false, refetchInterval: 20_000 });

  const [planForm, setPlanForm] = useState<typeof emptyPlan | null>(null);
  const [projectForm, setProjectForm] = useState<typeof emptyProject | null>(null);

  const upsertPlan = trpc.investAdmin.upsertPlan.useMutation({
    onSuccess: () => {
      toast.success("Plan saved");
      setPlanForm(null);
      refetchPlans();
    },
    onError: (err) => toast.error(err.message),
  });

  const deletePlan = trpc.investAdmin.deletePlan.useMutation({
    onSuccess: () => {
      toast.success("Plan deleted");
      refetchPlans();
    },
    onError: (err) => toast.error(err.message),
  });

  const upsertProject = trpc.investAdmin.upsertProject.useMutation({
    onSuccess: () => {
      toast.success("Project saved");
      setProjectForm(null);
      refetchProjects();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteProject = trpc.investAdmin.deleteProject.useMutation({
    onSuccess: () => {
      toast.success("Project deleted");
      refetchProjects();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      {/* ── Plans ── */}
      <SectionCard
        title="Investment Plans"
        subtitle={`${plans?.length ?? 0} plans`}
        action={
          <Button size="sm" onClick={() => setPlanForm(emptyPlan)} className="bg-[#1e3a5f]">
            <Plus className="w-4 h-4 mr-1" /> Add Plan
          </Button>
        }
      >
        <div className="grid md:grid-cols-3 gap-4">
          {(plans ?? []).map((plan: any) => (
            <div key={plan.id} className="bg-[#faf8f5] rounded-xl p-5 border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-[#1e3a5f] flex items-center gap-2">
                    {plan.name}
                    {plan.featured === "yes" && <Star className="w-4 h-4 text-[#c8956c] fill-current" />}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Min {formatCurrency(plan.minAmount).replace(".00", "")} · up to {plan.targetReturn}% · {plan.durationMonths} mo
                  </p>
                </div>
                <StatusBadge status={plan.isActive === "yes" ? "active" : "cancelled"} />
              </div>
              <ul className="text-xs text-gray-500 space-y-1 mb-4">
                {parsePlanFeatures(plan.features).slice(0, 3).map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-[#1e3a5f] text-[#1e3a5f] h-8 text-xs"
                  onClick={() =>
                    setPlanForm({
                      id: plan.id,
                      name: plan.name,
                      minAmount: String(Number(plan.minAmount)),
                      targetReturn: String(plan.targetReturn),
                      durationMonths: String(plan.durationMonths),
                      featured: plan.featured,
                      description: plan.description ?? "",
                      featuresText: parsePlanFeatures(plan.features).join("\n"),
                      isActive: plan.isActive,
                      sortOrder: plan.sortOrder,
                    })
                  }
                >
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-500 h-8 text-xs"
                  onClick={() => {
                    if (window.confirm(`Delete the ${plan.name} plan?`)) {
                      deletePlan.mutate({ id: plan.id });
                    }
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Projects ── */}
      <SectionCard
        title="Investment Projects"
        subtitle={`${projects?.length ?? 0} projects`}
        action={
          <Button size="sm" onClick={() => setProjectForm(emptyProject)} className="bg-[#1e3a5f]">
            <Plus className="w-4 h-4 mr-1" /> Add Project
          </Button>
        }
      >
        <div className="grid md:grid-cols-2 gap-4">
          {(projects ?? []).map((project: any) => {
            const pct = Number(project.targetAmount) > 0
              ? Math.min(Math.round((Number(project.raisedAmount) / Number(project.targetAmount)) * 100), 100)
              : 0;
            return (
              <div key={project.id} className="bg-[#faf8f5] rounded-xl p-5 border border-gray-100 flex gap-4">
                <img
                  src={project.image || "/images/home-exterior-1.jpg"}
                  alt={project.name}
                  className="w-20 h-20 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-[#1e3a5f] truncate">{project.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#c8956c]" />
                        {project.location} · up to {project.expectedReturn}%
                      </p>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                      <span>{formatCurrency(project.raisedAmount).replace(".00", "")} raised</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#1e3a5f] to-[#c8956c] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      className="text-xs font-semibold text-[#1e3a5f] hover:underline"
                      onClick={() =>
                        setProjectForm({
                          id: project.id,
                          name: project.name,
                          location: project.location,
                          category: project.category,
                          description: project.description ?? "",
                          image: project.image ?? "",
                          targetAmount: String(Number(project.targetAmount)),
                          expectedReturn: String(project.expectedReturn),
                          durationMonths: String(project.durationMonths),
                          status: project.status,
                        })
                      }
                    >
                      Edit
                    </button>
                    <button
                      className="text-xs font-semibold text-red-500 hover:underline"
                      onClick={() => {
                        if (window.confirm(`Delete ${project.name}?`)) {
                          deleteProject.mutate({ id: project.id });
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ── Plan form modal ── */}
      {planForm && (
        <Modal title={planForm.id ? "Edit Plan" : "New Plan"} onClose={() => setPlanForm(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Plan Name</Label>
                <Input value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label>Min Amount ($)</Label>
                <Input type="number" value={planForm.minAmount} onChange={(e) => setPlanForm({ ...planForm, minAmount: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label>Target Return (%)</Label>
                <Input type="number" value={planForm.targetReturn} onChange={(e) => setPlanForm({ ...planForm, targetReturn: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label>Duration (months)</Label>
                <Input type="number" value={planForm.durationMonths} onChange={(e) => setPlanForm({ ...planForm, durationMonths: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label>Sort Order</Label>
                <Input type="number" value={planForm.sortOrder} onChange={(e) => setPlanForm({ ...planForm, sortOrder: Number(e.target.value) })} className="mt-1.5" />
              </div>
              <div>
                <Label>Featured</Label>
                <select value={planForm.featured} onChange={(e) => setPlanForm({ ...planForm, featured: e.target.value as any })} className="mt-1.5 w-full h-10 rounded-md border border-input px-3 text-sm">
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div>
                <Label>Status</Label>
                <select value={planForm.isActive} onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.value as any })} className="mt-1.5 w-full h-10 rounded-md border border-input px-3 text-sm">
                  <option value="yes">Active</option>
                  <option value="no">Inactive</option>
                </select>
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Input value={planForm.description} onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })} className="mt-1.5" />
              </div>
              <div className="col-span-2">
                <Label>Features (one per line)</Label>
                <textarea
                  value={planForm.featuresText}
                  onChange={(e) => setPlanForm({ ...planForm, featuresText: e.target.value })}
                  rows={4}
                  className="mt-1.5 w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-[#1e3a5f]"
                disabled={upsertPlan.isPending}
                onClick={() => {
                  if (!planForm.name || !planForm.minAmount || !planForm.targetReturn || !planForm.durationMonths) {
                    toast.error("Fill in all required fields");
                    return;
                  }
                  upsertPlan.mutate({
                    id: planForm.id,
                    name: planForm.name,
                    minAmount: Number(planForm.minAmount),
                    targetReturn: Number(planForm.targetReturn),
                    durationMonths: Number(planForm.durationMonths),
                    featured: planForm.featured,
                    description: planForm.description,
                    features: planForm.featuresText.split("\n").map((f) => f.trim()).filter(Boolean),
                    isActive: planForm.isActive,
                    sortOrder: planForm.sortOrder,
                  });
                }}
              >
                <Layers className="w-4 h-4 mr-2" />
                {upsertPlan.isPending ? "Saving..." : "Save Plan"}
              </Button>
              <Button variant="outline" onClick={() => setPlanForm(null)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Project form modal ── */}
      {projectForm && (
        <Modal title={projectForm.id ? "Edit Project" : "New Project"} onClose={() => setProjectForm(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Project Name</Label>
                <Input value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label>Location</Label>
                <Input value={projectForm.location} onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label>Category</Label>
                <Input value={projectForm.category} onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label>Target Amount ($)</Label>
                <Input type="number" value={projectForm.targetAmount} onChange={(e) => setProjectForm({ ...projectForm, targetAmount: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label>Expected Return (%)</Label>
                <Input type="number" value={projectForm.expectedReturn} onChange={(e) => setProjectForm({ ...projectForm, expectedReturn: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label>Duration (months)</Label>
                <Input type="number" value={projectForm.durationMonths} onChange={(e) => setProjectForm({ ...projectForm, durationMonths: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label>Status</Label>
                <select value={projectForm.status} onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value as any })} className="mt-1.5 w-full h-10 rounded-md border border-input px-3 text-sm">
                  <option value="open">Open</option>
                  <option value="funding">Funding</option>
                  <option value="funded">Funded</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="col-span-2">
                <Label>Image URL</Label>
                <Input value={projectForm.image} onChange={(e) => setProjectForm({ ...projectForm, image: e.target.value })} placeholder="/images/home-exterior-1.jpg" className="mt-1.5" />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  rows={3}
                  className="mt-1.5 w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-[#1e3a5f]"
                disabled={upsertProject.isPending}
                onClick={() => {
                  if (!projectForm.name || !projectForm.location || !projectForm.category || !projectForm.targetAmount) {
                    toast.error("Fill in all required fields");
                    return;
                  }
                  upsertProject.mutate({
                    id: projectForm.id,
                    name: projectForm.name,
                    location: projectForm.location,
                    category: projectForm.category,
                    description: projectForm.description,
                    image: projectForm.image,
                    targetAmount: Number(projectForm.targetAmount),
                    expectedReturn: Number(projectForm.expectedReturn || 0),
                    durationMonths: Number(projectForm.durationMonths || 12),
                    status: projectForm.status,
                  });
                }}
              >
                {upsertProject.isPending ? "Saving..." : "Save Project"}
              </Button>
              <Button variant="outline" onClick={() => setProjectForm(null)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
