import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import API from "../../services/api";
import toast from "react-hot-toast";
import { FiPlus, FiAlertCircle, FiEdit2, FiTrash2 } from "react-icons/fi";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  techStack: string[];
  methodology: string;
  priority: "low" | "medium" | "high";
  status: "planning" | "active" | "completed";
  projectManager?: User;
  assignedEmployees: User[];
  startDate?: string;
  endDate?: string;
}

const projectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  techStack: z.string().min(1, "Tech stack is required"),
  methodology: z.string().min(1, "Methodology is required"),
  priority: z.enum(["low", "medium", "high"]),
  projectManager: z.string().min(1, "Please assign a Project Manager"),
  assignedEmployees: z.array(z.string()),
  status: z.enum(["planning", "active", "completed"]),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const ProjectManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [pms, setPms] = useState<User[]>([]);
  const [devs, setDevs] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      assignedEmployees: [],
      status: "planning",
      methodology: "Agile/Scrum",
    }
  });

  // Manually register custom/hidden fields so React Hook Form tracks them during submit
  useEffect(() => {
    register("status");
    register("assignedEmployees");
  }, [register]);

  // Toast validation errors to avoid silent form submission blocks
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Form Validation Errors:", errors);

      const firstError = Object.values(errors)[0] as any;

      if (firstError?.message) {
        toast.error(firstError.message, {
          icon: <FiAlertCircle size={20} />,
        });
      }
    }
  }, [errors]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch projects
      const projRes = await API.get("/projects");
      if (projRes.data.success) {
        setProjects(projRes.data.projects);
      }

      // Fetch managers
      const pmRes = await API.get("/employees?role=project_manager");
      if (pmRes.data.success) {
        setPms(pmRes.data.employees);
      }

      // Fetch employees/devs
      const devRes = await API.get("/employees?role=employee");
      if (devRes.data.success) {
        setDevs(devRes.data.employees);
      }
    } catch (error) {
      toast.error("Failed to fetch dashboard resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditProject(null);
    reset({
      name: "",
      description: "",
      techStack: "",
      methodology: "Agile/Scrum",
      priority: "medium",
      projectManager: "",
      assignedEmployees: [],
      status: "planning",
    });
    setModalOpen(true);
  };

  const openEditModal = (proj: Project) => {
    setEditProject(proj);
    reset({
      name: proj.name,
      description: proj.description,
      techStack: proj.techStack?.join(", ") || "",
      methodology: proj.methodology || "Agile/Scrum",
      priority: proj.priority || "medium",
      projectManager: proj.projectManager?._id || "",
      assignedEmployees: proj.assignedEmployees?.map((d) => d._id) || [],
      status: proj.status || "planning",
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this project? Sprints, tasks, and discussion logs will be deleted permanently.")) return;
    try {
      const response = await API.delete(`/projects/${id}`);
      if (response.data.success) {
        toast.success("Project deleted successfully");
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete project");
    }
  };

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      if (editProject) {
        // Update Project
        const response = await API.put(`/projects/${editProject._id}`, data);
        if (response.data.success) {
          toast.success("Project updated successfully");
          setModalOpen(false);
          fetchData();
        }
      } else {
        // Register Project
        const response = await API.post("/projects", data);
        if (response.data.success) {
          toast.success("Project registered successfully");
          setModalOpen(false);
          fetchData();
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save project");
    }
  };

  const handleDevCheckboxChange = (devId: string, checked: boolean, currentDevs: string[] = []) => {
    const list = [...currentDevs];
    if (checked) {
      list.push(devId);
    } else {
      const idx = list.indexOf(devId);
      if (idx > -1) list.splice(idx, 1);
    }
    setValue("assignedEmployees", list);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-200">System Projects</h2>
          <p className="text-xs text-gray-500 mt-1">Register projects, map methodologies, and assign leadership roles</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer flex items-center gap-2"
        >
          <FiPlus size={15} />
          <span>Register New Project</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-75">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full glass-card p-12 text-center text-gray-500 rounded-2xl italic border border-[#1e2e4f]/20">
              No software projects registered. Register one to begin project planning.
            </div>
          ) : (
            projects.map((proj) => (
              <div
                key={proj._id}
                className="glass-card rounded-2xl p-6 border border-[#1e2e4f]/35 flex flex-col justify-between hover:border-blue-500/35 transition-all shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${proj.priority === "high"
                        ? "bg-red-950/40 text-red-400 border border-red-900/40"
                        : proj.priority === "medium"
                          ? "bg-yellow-950/40 text-yellow-400 border border-yellow-900/30"
                          : "bg-blue-950/40 text-blue-400 border border-blue-900/30"
                        }`}
                    >
                      {proj.priority} Priority
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${proj.status === "completed"
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40"
                        : proj.status === "active"
                          ? "bg-blue-950/40 text-blue-400 border border-blue-900/40"
                          : "bg-gray-800 text-gray-400 border border-gray-700"
                        }`}
                    >
                      {proj.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-100 truncate mb-1">{proj.name}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                    {proj.description}
                  </p>

                  <div className="space-y-2 text-xs border-t border-[#1e2e4f]/15 pt-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Methodology:</span>
                      <span className="text-gray-300 font-semibold">{proj.methodology}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Manager (PM):</span>
                      <span className="text-blue-400 font-semibold">
                        {proj.projectManager?.name || "Unassigned"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Staff Assigned:</span>
                      <span className="text-gray-300 font-semibold">
                        {proj.assignedEmployees?.length || 0} Developers
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {proj.techStack?.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 bg-gray-900 border border-gray-800/80 rounded text-[10px] text-gray-400"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-[#1e2e4f]/15">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(proj)}
                      title="Edit project"
                      className="h-8 w-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 border border-gray-700/50 rounded-lg text-gray-300 hover:text-white transition-all cursor-pointer"
                    >
                      <FiEdit2 size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(proj._id)}
                      title="Delete project"
                      className="h-8 w-8 flex items-center justify-center bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 rounded-lg text-red-400 hover:text-red-300 transition-all cursor-pointer"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Register/Edit Project Modal Overlay */}
      {/* Register/Edit Project Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-9999 bg-black/70 backdrop-blur-sm">

          <div className="absolute inset-0 overflow-y-auto">

            <div className="min-h-full flex items-center justify-center p-4">

              <div
                className="w-full max-w-3xl bg-[#111827] rounded-2xl border border-[#1e2e4f]/50 shadow-2xl p-6"
              >

                {/* Header */}
                <h3 className="text-lg font-bold text-gray-100 mb-4 border-b border-[#1e2e4f]/25 pb-3">
                  {editProject
                    ? "Edit Project Blueprint"
                    : "Register New Project Outline"}
                </h3>

                {/* Form */}
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4"
                >

                  {/* Project Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">
                      Project Name
                    </label>

                    <input
                      type="text"
                      placeholder="E-Commerce CRM Platform"
                      {...register("name")}
                      className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    />

                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">
                      Description
                    </label>

                    <textarea
                      rows={3}
                      placeholder="Enter high-level goals and project objective details..."
                      {...register("description")}
                      className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm resize-none"
                    />

                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Tech Stack + Methodology */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">
                        Tech Stack
                      </label>

                      <input
                        type="text"
                        placeholder="React, Express, MongoDB"
                        {...register("techStack")}
                        className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      />

                      {errors.techStack && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.techStack.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">
                        Methodology
                      </label>

                      <input
                        type="text"
                        placeholder="Scrum"
                        {...register("methodology")}
                        className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      />
                    </div>

                  </div>

                  {/* Priority + Project Manager */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">
                        Priority
                      </label>

                      <select
                        {...register("priority")}
                        className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">
                        Assign Project Manager
                      </label>

                      <select
                        {...register("projectManager")}
                        className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      >
                        <option value="">-- Choose PM --</option>

                        {pms.map((pm) => (
                          <option key={pm._id} value={pm._id}>
                            {pm.name}
                          </option>
                        ))}
                      </select>

                      {errors.projectManager && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.projectManager.message}
                        </p>
                      )}
                    </div>

                  </div>

                  {/* Status */}
                  {editProject && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">
                        Status
                      </label>

                      <select
                        {...register("status")}
                        className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      >
                        <option value="planning">Planning (New)</option>
                        <option value="active">Active (Started)</option>
                        <option value="completed">Completed (Archived)</option>
                      </select>
                    </div>
                  )}

                  {/* Developer Assignment */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">
                      Assign Team Members
                    </label>

                    <div className="bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg p-3 max-h-35 overflow-y-auto space-y-2">

                      {devs.length === 0 ? (
                        <span className="text-xs text-gray-600 italic">
                          No developer accounts available
                        </span>
                      ) : (
                        devs.map((dev) => (
                          <label
                            key={dev._id}
                            className="flex items-center gap-3 text-xs text-gray-300 hover:text-gray-100 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              value={dev._id}
                              className="rounded border-[#1e2e4f]/40 bg-gray-900 text-blue-500 focus:ring-0 cursor-pointer"
                              onChange={(e) => {
                                const current =
                                  getValues("assignedEmployees") || [];

                                handleDevCheckboxChange(
                                  dev._id,
                                  e.target.checked,
                                  current
                                );
                              }}
                              defaultChecked={editProject?.assignedEmployees.some(
                                (d) => d._id === dev._id
                              )}
                            />

                            <span>
                              {dev.name} ({dev.email})
                            </span>
                          </label>
                        ))
                      )}

                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4 justify-end pt-4 border-t border-[#1e2e4f]/25">

                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-xs hover:bg-gray-700 cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-500 cursor-pointer font-semibold flex items-center justify-center min-w-22.5"
                    >
                      {isSubmitting ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "Save Project"
                      )}
                    </button>

                  </div>

                </form>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
