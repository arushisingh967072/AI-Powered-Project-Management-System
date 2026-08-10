import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import toast from "react-hot-toast";

// Interface definitions
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  skills?: string[];
}

interface Project {
  _id: string;
  name: string;
  description: string;
  techStack: string[];
  methodology: string;
  priority: string;
  status: string;
  projectManager?: User;
  assignedEmployees: User[];
  srsDocument?: any;
}

interface Sprint {
  _id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: "active" | "completed";
}

interface Task {
  _id: string;
  name: string;
  description: string;
  techStack: string[];
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "testing" | "done";
  deadline: string;
  assignedEmployee?: User;
  sprint?: { _id: string; name: string };
  statusHistory: any[];
}

interface Bug {
  _id: string;
  name: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "testing" | "done";
  deadline: string;
  assignedEmployee?: User;
  reportedBy: User;
  sprint?: { _id: string; name: string };
}

interface DiscussionMessage {
  _id: string;
  sender: User;
  message: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
}

const ProjectDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState<"overview" | "srs" | "sprints" | "tasks" | "bugs" | "report">("overview");

  // Domain Data
  const [project, setProject] = useState<Project | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [reportData, setReportData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals Open States
  const [sprintModalOpen, setSprintModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [bugModalOpen, setBugModalOpen] = useState(false);

  // Details Modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);

  // Discussion state inside details modal
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [typedMessage, setTypedMessage] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  // Form Fields State
  const [sprintForm, setSprintForm] = useState({ name: "", goal: "", startDate: "", endDate: "" });
  const [taskForm, setTaskForm] = useState({ name: "", description: "", techStack: "", priority: "medium", assignedEmployee: "", deadline: "", sprint: "", generateWithAI: false });
  const [bugForm, setBugForm] = useState({ name: "", description: "", severity: "medium", priority: "medium", assignedEmployee: "", deadline: "", sprint: "" });

  const isPM = user?.role === "project_manager";

  // Fetch API routines
  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const resProj = await API.get(`/projects/${projectId}`);
      if (resProj.data.success) {
        setProject(resProj.data.project);
      }

      const resSprints = await API.get(`/sprints/project/${projectId}`);
      if (resSprints.data.success) {
        setSprints(resSprints.data.sprints);
      }

      const resTasks = await API.get(`/tasks/project/${projectId}`);
      if (resTasks.data.success) {
        setTasks(resTasks.data.tasks);
      }

      const resBugs = await API.get(`/bugs/project/${projectId}`);
      if (resBugs.data.success) {
        setBugs(resBugs.data.bugs);
      }
    } catch (err: any) {
      console.error("❌ fetchProjectData failed:", err);
      toast.error(err.response?.data?.message || "Unauthorized or project not found");
      navigate(user?.role === "project_manager" ? "/pm" : "/employee");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  // Load discussion thread when a task/bug is selected
  useEffect(() => {
    const fetchDiscussion = async () => {
      const targetType = selectedTask ? "task" : "bug";
      const targetId = selectedTask ? selectedTask._id : selectedBug?._id;
      if (!targetId) return;

      try {
        const res = await API.get(`/messages/${targetType}/${targetId}`);
        if (res.data.success) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        console.error("Discussion load error", err);
      }
    };

    if (selectedTask || selectedBug) {
      fetchDiscussion();
      const interval = setInterval(fetchDiscussion, 4000); // Poll messages
      return () => clearInterval(interval);
    }
  }, [selectedTask, selectedBug]);

  // Handler: Generate AI SRS
  const handleGenerateSRS = async () => {
    try {
      toast.loading("AI Requirements Engineering is modeling specifications...", { id: "srsGen" });
      const res = await API.post(`/projects/${projectId}/generate-srs`);
      if (res.data.success) {
        setProject((prev: any) => ({ ...prev, srsDocument: res.data.srsDocument }));
        toast.success("AI SRS document generated successfully!", { id: "srsGen" });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "SRS Generation failed", { id: "srsGen" });
    }
  };

  // Handler: Generate Report
  const handleGenerateReport = async () => {
    try {
      const res = await API.get(`/projects/${projectId}/report`);
      if (res.data.success) {
        setReportData(res.data.report);
        toast.success("Final report generated!");
      }
    } catch (err: any) {
      toast.error("Failed to compile project reports");
    }
  };

  // Create sprint submit
  const handleSprintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprintForm.name || !sprintForm.goal || !sprintForm.startDate || !sprintForm.endDate) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      const res = await API.post("/sprints", { ...sprintForm, project: projectId });
      if (res.data.success) {
        toast.success("Sprint created successfully!");
        setSprintModalOpen(false);
        fetchProjectData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Sprint creation failed");
    }
  };

  // Toggle sprint status
  const handleToggleSprintStatus = async (sprintId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "completed" : "active";
    try {
      const res = await API.put(`/sprints/${sprintId}`, { status: nextStatus });
      if (res.data.success) {
        toast.success(`Sprint marked ${nextStatus}`);
        fetchProjectData();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // Create task submit
  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.name || !taskForm.deadline) {
      toast.error("Task Name and Deadline are required");
      return;
    }
    try {
      toast.loading("Adding Task...", { id: "taskAdd" });
      const res = await API.post("/tasks", {
        ...taskForm,
        project: projectId,
        sprint: taskForm.sprint || undefined,
        assignedEmployee: taskForm.assignedEmployee || undefined,
      });
      if (res.data.success) {
        toast.success("Task logged successfully!", { id: "taskAdd" });
        setTaskModalOpen(false);
        fetchProjectData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Task save failed", { id: "taskAdd" });
    }
  };

  // Create bug submit
  const handleBugSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugForm.name || !bugForm.deadline) {
      toast.error("Bug Name and Deadline are required");
      return;
    }
    try {
      const res = await API.post("/bugs", {
        ...bugForm,
        project: projectId,
        sprint: bugForm.sprint || undefined,
        assignedEmployee: bugForm.assignedEmployee || undefined,
      });
      if (res.data.success) {
        toast.success("Bug ticket reported!");
        setBugModalOpen(false);
        fetchProjectData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Bug report failed");
    }
  };

  // Transition task/bug status
  const handleStatusTransition = async (id: string, type: "task" | "bug", nextStatus: string) => {
    try {
      const res = await API.patch(`/${type}s/${id}/status`, { status: nextStatus });
      if (res.data.success) {
        toast.success(`Status updated to ${nextStatus}`);
        fetchProjectData();
        // Update local selected state if open
        if (selectedTask && selectedTask._id === id) {
          setSelectedTask(res.data.task);
        } else if (selectedBug && selectedBug._id === id) {
          setSelectedBug(res.data.bug);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Transition denied");
    }
  };

  // Discussion send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() && !attachedFile) return;

    try {
      let fileUrl = "";
      let fileName = "";

      if (attachedFile) {
        setUploadingAttachment(true);
        const formData = new FormData();
        formData.append("file", attachedFile);
        const uploadRes = await API.post("/messages/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (uploadRes.data.success) {
          fileUrl = uploadRes.data.fileUrl;
          fileName = uploadRes.data.fileName;
        }
      }

      const payload = {
        targetType: selectedTask ? "task" : "bug",
        targetId: selectedTask ? selectedTask._id : selectedBug?._id,
        message: typedMessage || `Shared a file: ${fileName}`,
        fileUrl: fileUrl || undefined,
        fileName: fileName || undefined,
      };

      const res = await API.post("/messages", payload);
      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.discussionMessage]);
        setTypedMessage("");
        setAttachedFile(null);
      }
    } catch (err) {
      toast.error("Failed to post message");
    } finally {
      setUploadingAttachment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="space-y-6">
      {/* Title Details block */}
      <div className="glass-card rounded-2xl p-6 border border-[#1e2e4f]/35 flex flex-col md:flex-row justify-between gap-4">
        <div>
          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-blue-950/40 text-blue-400 border border-blue-900/40">
            Project Workspace
          </span>
          <h2 className="text-2xl font-bold text-gray-200 mt-2">{project.name}</h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xl leading-relaxed">{project.description}</p>
        </div>
        <div className="text-xs space-y-1.5 self-start text-gray-400">
          <div>
            Methodology: <span className="text-gray-300 font-semibold">{project.methodology}</span>
          </div>
          <div>
            Priority: <span className="text-gray-300 font-semibold uppercase">{project.priority}</span>
          </div>
          <div>
            Manager: <span className="text-blue-400 font-semibold">{project.projectManager?.name}</span>
          </div>
        </div>
      </div>

      {/* Tabs Menu bar */}
      <div className="flex border-b border-[#1e2e4f]/30 gap-6 text-sm overflow-x-auto">
        {(["overview", "srs", "sprints", "tasks", "bugs", "report"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 font-semibold capitalize transition-all border-b-2 cursor-pointer ${activeTab === tab
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
          >
            {tab === "srs" ? "AI SRS Document" : tab === "report" ? "Final Report" : tab}
          </button>
        ))}
      </div>

      {/* Tab Panel contents */}
      <div className="min-h-75">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-6 border border-[#1e2e4f]/30 space-y-4">
              <h3 className="text-base font-bold text-gray-200 border-b border-[#1e2e4f]/20 pb-2">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack?.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-gray-800 border border-gray-700/50 rounded-lg text-xs text-gray-300 font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-[#1e2e4f]/30 space-y-4">
              <h3 className="text-base font-bold text-gray-200 border-b border-[#1e2e4f]/20 pb-2">
                Assigned Team Members
              </h3>
              <div className="space-y-3">
                {project.assignedEmployees?.map((emp) => (
                  <div key={emp._id} className="flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-gray-200">{emp.name}</div>
                      <div className="text-gray-500 font-mono">{emp.email}</div>
                    </div>
                    <span className="px-2 py-0.5 bg-gray-800 border border-gray-700 rounded text-[10px] text-gray-400 capitalize">
                      {emp.department || "Dev"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI SRS DOCUMENT */}
        {activeTab === "srs" && (
          <div className="glass-card rounded-2xl p-8 border border-[#1e2e4f]/35 space-y-6">
            <div className="flex items-center justify-between border-b border-[#1e2e4f]/20 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-100">Software Requirements Specification</h3>
                <p className="text-xs text-gray-500">AI model-generated SRS based on project outlines</p>
              </div>
              {isPM && (
                <button
                  onClick={handleGenerateSRS}
                  className="px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
                >
                  ⚡ {project.srsDocument ? "Regenerate with AI" : "Generate SRS using AI"}
                </button>
              )}
            </div>

            {project.srsDocument ? (
              <div className="space-y-8 text-sm text-gray-300 leading-relaxed max-w-4xl bg-[#090e1a] p-8 border border-gray-800/80 rounded-xl relative shadow-inner">
                {/* PDF Simulation Header */}
                <div className="text-center pb-6 border-b border-gray-800 mb-6 flex justify-between items-center text-xs text-gray-500">
                  <span>AI Powered PMS Generation v1.0</span>
                  <button
                    onClick={() => window.print()}
                    className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 rounded text-[10px] text-gray-400 border border-gray-700 cursor-pointer"
                  >
                    🖨️ Print Spec Sheets
                  </button>
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-blue-400 mb-2">1. Introduction</h4>
                  <div className="space-y-3 pl-4">
                    <p>
                      <strong>1.1 Purpose:</strong> {project.srsDocument.introduction?.purpose}
                    </p>
                    <p>
                      <strong>1.2 Scope:</strong> {project.srsDocument.introduction?.scope}
                    </p>
                    <div>
                      <strong>1.3 Objectives:</strong>
                      <ul className="list-disc pl-5 mt-1.5 space-y-1">
                        {project.srsDocument.introduction?.objectives?.map((obj: string, i: number) => (
                          <li key={i}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-blue-400 mb-2">2. Overall Description</h4>
                  <p className="pl-4">{project.srsDocument.overallDescription}</p>
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-blue-400 mb-2">3. Functional Requirements</h4>
                  <div className="space-y-4 pl-4">
                    <div>
                      <h5 className="font-bold text-gray-200">3.1 Administrator Module</h5>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        {project.srsDocument.functionalRequirements?.adminModule?.map((f: string, i: number) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-200">3.2 Project Manager Module</h5>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        {project.srsDocument.functionalRequirements?.pmModule?.map((f: string, i: number) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-200">3.3 Employee Module</h5>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        {project.srsDocument.functionalRequirements?.employeeModule?.map((f: string, i: number) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-blue-400 mb-2">4. Non-Functional Requirements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                    <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                      <strong className="text-gray-200 text-xs uppercase block mb-1">Performance</strong>
                      <p className="text-xs text-gray-400">{project.srsDocument.nonFunctionalRequirements?.performance}</p>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                      <strong className="text-gray-200 text-xs uppercase block mb-1">Security</strong>
                      <p className="text-xs text-gray-400">{project.srsDocument.nonFunctionalRequirements?.security}</p>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                      <strong className="text-gray-200 text-xs uppercase block mb-1">Reliability</strong>
                      <p className="text-xs text-gray-400">{project.srsDocument.nonFunctionalRequirements?.reliability}</p>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                      <strong className="text-gray-200 text-xs uppercase block mb-1">Scalability</strong>
                      <p className="text-xs text-gray-400">{project.srsDocument.nonFunctionalRequirements?.scalability}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500 italic border border-dashed border-[#1e2e4f]/30 rounded-xl">
                No SRS document registered. {isPM ? "Click the button above to generate a complete software specification dynamically." : "Ask the PM to generate one."}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SPRINTS */}
        {activeTab === "sprints" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-200">Milestone Sprints</h3>
                <p className="text-xs text-gray-500 mt-1">Schedules and business targets mapping sprint deliverables</p>
              </div>
              {isPM && (
                <button
                  onClick={() => setSprintModalOpen(true)}
                  className="px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
                >
                  ➕ Create Sprint
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sprints.length === 0 ? (
                <div className="col-span-full p-12 text-center text-gray-500 italic border border-[#1e2e4f]/20 rounded-xl glass-card">
                  No active sprints in this project cycle.
                </div>
              ) : (
                sprints.map((s) => (
                  <div
                    key={s._id}
                    className="glass-card rounded-2xl p-6 border border-[#1e2e4f]/30 flex flex-col justify-between shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-100">{s.name}</h4>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${s.status === "completed"
                            ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40"
                            : "bg-blue-950/40 text-blue-400 border border-blue-900/40"
                            }`}
                        >
                          {s.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed mb-4">{s.goal}</p>
                      <div className="text-[11px] font-mono text-gray-500 space-y-1">
                        <div>
                          Start: {new Date(s.startDate).toLocaleDateString()}
                        </div>
                        <div>
                          End: {new Date(s.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {isPM && (
                      <button
                        onClick={() => handleToggleSprintStatus(s._id, s.status)}
                        className={`w-full mt-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${s.status === "active"
                          ? "bg-emerald-950/20 hover:bg-emerald-950/40 border-emerald-900/30 text-emerald-400"
                          : "bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-400"
                          }`}
                      >
                        {s.status === "active" ? "✓ Close Sprint" : "⚙ Reopen Sprint"}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: TASKS */}
        {activeTab === "tasks" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-200">Sprint Tasks Kanban</h3>
                <p className="text-xs text-gray-500 mt-1">Develop specs, transition workflows, and collaborate</p>
              </div>
              {isPM && (
                <button
                  onClick={() => setTaskModalOpen(true)}
                  className="px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
                >
                  ➕ Create Task
                </button>
              )}
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {(["todo", "in_progress", "testing", "done"] as const).map((col) => {
                const colTasks = tasks.filter((t) => t.status === col);
                const colLabel =
                  col === "todo"
                    ? "To Do"
                    : col === "in_progress"
                      ? "In Progress"
                      : col === "testing"
                        ? "Internal Testing"
                        : "Completed Done";
                const colColor =
                  col === "todo"
                    ? "border-t-2 border-gray-600 text-gray-400 bg-gray-900/10"
                    : col === "in_progress"
                      ? "border-t-2 border-blue-500 text-blue-400 bg-blue-950/5"
                      : col === "testing"
                        ? "border-t-2 border-purple-500 text-purple-400 bg-purple-950/5"
                        : "border-t-2 border-emerald-500 text-emerald-400 bg-emerald-950/5";

                return (
                  <div key={col} className={`glass-card rounded-2xl p-4 border border-[#1e2e4f]/20 flex flex-col space-y-4 ${colColor}`}>
                    <div className="flex items-center justify-between border-b border-[#1e2e4f]/15 pb-2">
                      <h4 className="font-bold text-xs uppercase tracking-wider">{colLabel}</h4>
                      <span className="px-2 py-0.5 bg-gray-950/40 border border-gray-800 rounded-full text-[10px] text-gray-400">
                        {colTasks.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto max-h-100">
                      {colTasks.length === 0 ? (
                        <div className="py-8 text-center text-xs text-gray-600 italic">No tasks</div>
                      ) : (
                        colTasks.map((task) => (
                          <div
                            key={task._id}
                            onClick={() => setSelectedTask(task)}
                            className="bg-[#0b0f19] hover:bg-[#0f1526]/85 border border-[#1e2e4f]/25 rounded-xl p-4 space-y-3 shadow cursor-pointer transition-all hover:scale-[1.01] hover:border-blue-500/20"
                          >
                            <h5 className="font-bold text-sm text-gray-200 line-clamp-1">{task.name}</h5>
                            <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                              {task.description.replace(/[#*`]/g, "")}
                            </p>

                            <div className="flex flex-wrap gap-1">
                              {task.techStack?.slice(0, 2).map((tech, i) => (
                                <span key={i} className="text-[9px] px-1 bg-gray-900 border border-gray-800 rounded text-gray-500">
                                  {tech}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center justify-between border-t border-[#1e2e4f]/10 pt-2.5 text-[10px] text-gray-500">
                              <span className="capitalize px-1.5 py-0.5 bg-gray-900 rounded font-semibold text-gray-400">
                                {task.priority} Priority
                              </span>
                              <span className="font-mono">
                                {new Date(task.deadline).toLocaleDateString()}
                              </span>
                            </div>

                            {task.assignedEmployee && (
                              <div className="flex items-center gap-2 pt-1">
                                <div className="h-5 w-5 rounded-full bg-blue-900/30 flex items-center justify-center font-bold text-[9px] text-blue-400 border border-blue-800/40 uppercase">
                                  {task.assignedEmployee.name.charAt(0)}
                                </div>
                                <span className="text-[10px] text-gray-400 truncate">
                                  {task.assignedEmployee.name}
                                </span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: BUGS */}
        {activeTab === "bugs" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-200">Active Software Defects</h3>
                <p className="text-xs text-gray-500 mt-1">Log issues, set priorities, and track bug fixes</p>
              </div>
              <button
                onClick={() => setBugModalOpen(true)}
                className="px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
              >
                ➕ Log Bug Report
              </button>
            </div>

            {/* Bugs List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bugs.length === 0 ? (
                <div className="col-span-full p-12 text-center text-gray-500 italic border border-[#1e2e4f]/20 rounded-xl glass-card">
                  No bug tickets reported. Code quality is clean!
                </div>
              ) : (
                bugs.map((bug) => (
                  <div
                    key={bug._id}
                    onClick={() => setSelectedBug(bug)}
                    className="glass-card rounded-2xl p-5 border border-red-950/20 hover:border-red-500/30 transition-all flex flex-col justify-between cursor-pointer shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${bug.severity === "critical"
                            ? "bg-red-950/60 text-red-400 border border-red-900/60"
                            : bug.severity === "high"
                              ? "bg-orange-950/40 text-orange-400 border border-orange-900/30"
                              : "bg-blue-950/40 text-blue-400 border border-blue-900/30"
                            }`}
                        >
                          {bug.severity} Severity
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${bug.status === "done"
                            ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40"
                            : bug.status === "testing"
                              ? "bg-purple-950/40 text-purple-400 border border-purple-900/40"
                              : "bg-gray-800 text-gray-400 border border-gray-700"
                            }`}
                        >
                          {bug.status.replace("_", " ")}
                        </span>
                      </div>

                      <h4 className="font-bold text-gray-100 truncate mb-1">{bug.name}</h4>
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4">{bug.description}</p>
                    </div>

                    <div className="border-t border-[#1e2e4f]/15 pt-3 flex items-center justify-between text-[10px] text-gray-500">
                      <span>Reported By: {bug.reportedBy?.name}</span>
                      {bug.assignedEmployee && (
                        <span className="px-2 py-0.5 bg-gray-900 border border-gray-800 rounded-lg text-gray-300">
                          Assignee: {bug.assignedEmployee.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 6: REPORTS */}
        {activeTab === "report" && (
          <div className="glass-card rounded-2xl p-8 border border-[#1e2e4f]/35 space-y-6">
            <div className="flex items-center justify-between border-b border-[#1e2e4f]/25 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-100">Project Telemetry Report</h3>
                <p className="text-xs text-gray-500">Exportable metrics detailing task schedules, sprint completions, and QA statistics</p>
              </div>
              <button
                onClick={handleGenerateReport}
                className="px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
              >
                📊 Generate Final Report
              </button>
            </div>

            {reportData ? (
              <div className="space-y-8 text-sm text-gray-300 leading-relaxed max-w-4xl bg-[#090e1a] p-8 border border-gray-800/80 rounded-xl shadow-inner font-sans">
                <div className="flex justify-between items-center text-xs text-gray-500 pb-4 border-b border-gray-800 mb-6">
                  <span>Report ID: {reportData.project.id}</span>
                  <button
                    onClick={() => window.print()}
                    className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 rounded text-[10px] text-gray-400 border border-gray-700 cursor-pointer"
                  >
                    🖨️ Export PDF
                  </button>
                </div>

                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-gray-100 uppercase tracking-wide">
                    Project Final Closeout Report
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">Generated on: {new Date(reportData.generatedAt).toLocaleDateString()}</p>
                </div>

                {/* Project Overview Sheet */}
                <div className="grid grid-cols-2 gap-6 p-4 bg-gray-900/35 border border-gray-800/80 rounded-xl text-xs">
                  <div>
                    <span className="block text-gray-500 mb-1">Project Name:</span>
                    <strong className="text-gray-200 text-sm">{reportData.project.name}</strong>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Project Manager (PM):</span>
                    <strong className="text-gray-200 text-sm">{reportData.project.projectManagerName}</strong>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Methodology Frame:</span>
                    <strong className="text-gray-200 text-sm">{reportData.project.methodology}</strong>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Overall Status:</span>
                    <strong className="text-gray-200 text-sm capitalize">{reportData.project.status}</strong>
                  </div>
                </div>

                {/* Metrics Breakdown cards */}
                <div>
                  <h5 className="font-extrabold text-blue-400 uppercase tracking-wider text-xs mb-3">
                    Milestone Metrics Summary
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-900 border border-gray-800/80 rounded-xl text-center">
                      <span className="block text-[10px] uppercase text-gray-500">Tasks Completed</span>
                      <strong className="text-xl text-gray-200 mt-1 block">
                        {reportData.metrics.completedTasks} / {reportData.metrics.totalTasks}
                      </strong>
                    </div>
                    <div className="p-4 bg-gray-900 border border-gray-800/80 rounded-xl text-center">
                      <span className="block text-[10px] uppercase text-gray-500">Task Close Rate</span>
                      <strong className="text-xl text-blue-400 mt-1 block">
                        {reportData.metrics.completionPercentage}%
                      </strong>
                    </div>
                    <div className="p-4 bg-gray-900 border border-gray-800/80 rounded-xl text-center">
                      <span className="block text-[10px] uppercase text-gray-500">Bugs Resolved</span>
                      <strong className="text-xl text-gray-200 mt-1 block">
                        {reportData.metrics.resolvedBugs} / {reportData.metrics.totalBugs}
                      </strong>
                    </div>
                    <div className="p-4 bg-gray-900 border border-gray-800/80 rounded-xl text-center">
                      <span className="block text-[10px] uppercase text-gray-500">QA Fix Rate</span>
                      <strong className="text-xl text-emerald-400 mt-1 block">
                        {reportData.metrics.bugResolutionPercentage}%
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Team performance metrics table */}
                <div>
                  <h5 className="font-extrabold text-blue-400 uppercase tracking-wider text-xs mb-3">
                    Team Contribution Breakdown
                  </h5>
                  <div className="overflow-x-auto border border-gray-800 rounded-xl">
                    <table className="w-full text-left text-xs text-gray-400">
                      <thead className="bg-gray-900/60 text-gray-500 uppercase border-b border-gray-800">
                        <tr>
                          <th className="p-3">Employee Name</th>
                          <th className="p-3">Role</th>
                          <th className="p-3 text-center">Tasks Closed</th>
                          <th className="p-3 text-center">Bugs Resolved</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/65">
                        {reportData.teamPerformance.map((emp: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-900/20">
                            <td className="p-3 text-gray-200 font-semibold">{emp.employeeName}</td>
                            <td className="p-3 capitalize">{emp.role}</td>
                            <td className="p-3 text-center text-blue-400 font-semibold font-mono">
                              {emp.tasksCompleted} / {emp.tasksAssigned}
                            </td>
                            <td className="p-3 text-center text-emerald-400 font-semibold font-mono">
                              {emp.bugsResolved} / {emp.bugsAssigned}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500 italic border border-dashed border-[#1e2e4f]/30 rounded-xl">
                Click the compile button above to perform analysis on tasks, sprints, and bug resolve timelines.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL: SPRINT CREATION
      ======================================================== */}
      {sprintModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-9999 bg-black/70 backdrop-blur-sm">

            <div className="absolute inset-0 overflow-y-auto">

              {/* Center modal */}
              <div className="min-h-full flex items-center justify-center p-4">

                <div
                  className="w-full max-w-xl bg-[#0d1627] rounded-2xl border border-[#1e2e4f]/50 shadow-2xl p-7"
                >

                  {/* Header */}
                  <h3 className="text-base font-bold text-gray-200 border-b border-[#1e2e4f]/25 pb-3 mb-4">
                    Create Agile Sprint
                  </h3>

                  {/* Form */}
                  <form
                    onSubmit={handleSprintSubmit}
                    className="space-y-4 text-xs"
                  >

                    {/* Sprint Name */}
                    <div>
                      <label className="block font-semibold text-gray-400 mb-1">
                        Sprint Name
                      </label>

                      <input
                        type="text"
                        placeholder="Sprint 1 - Foundations & Core Auth"
                        className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={sprintForm.name}
                        onChange={(e) =>
                          setSprintForm({
                            ...sprintForm,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Sprint Goal */}
                    <div>
                      <label className="block font-semibold text-gray-400 mb-1">
                        Sprint Goal
                      </label>

                      <textarea
                        rows={2}
                        placeholder="Implement database Schemas, configure auth routes, and wire React dashboards..."
                        className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-blue-500 resize-none focus:ring-1"
                        value={sprintForm.goal}
                        onChange={(e) =>
                          setSprintForm({
                            ...sprintForm,
                            goal: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Start Date + End Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      {/* Start Date */}
                      <div>
                        <label className="block font-semibold text-gray-400 mb-1">
                          Start Date
                        </label>

                        <input
                          type="date"
                          className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1" 
                          value={sprintForm.startDate}
                          onChange={(e) =>
                            setSprintForm({
                              ...sprintForm,
                              startDate: e.target.value,
                            })
                          }
                        />
                      </div>

                      {/* End Date */}
                      <div>
                        <label className="block font-semibold text-gray-400 mb-1">
                          End Date
                        </label>

                        <input
                          type="date"
                          className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1focus:ring-blue-500"
                          value={sprintForm.endDate}
                          onChange={(e) =>
                            setSprintForm({
                              ...sprintForm,
                              endDate: e.target.value,
                            })
                          }
                        />
                      </div>

                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 justify-end pt-3 border-t border-[#1e2e4f]/25">

                      <button type="button"
                        onClick={() => setSprintModalOpen(false)}
                        className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg font-semibold hover:bg-gray-700 cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                       className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 cursor-pointer"
                      >
                        Create
                      </button>

                    </div>

                  </form>
                </div>

              </div>
            </div>
          </div>,

          document.body
        )}
      {/* ========================================================
    MODAL: TASK CREATION
======================================================== */}
      {taskModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-9999 bg-black/70 backdrop-blur-sm">

            {/* Full screen scroll area */}
            <div className="absolute inset-0 overflow-y-auto">

              {/* Center modal */}
              <div className="min-h-full flex items-center justify-center p-4">

                <div
                  className="w-full max-w-2xl bg-[#0d1627] rounded-2xl border border-[#1e2e4f]/50 shadow-2xl p-6"
                >

                  {/* Header */}
                  <h3 className="text-base font-bold text-gray-200 border-b border-[#1e2e4f]/25 pb-3 mb-4">
                    Add Project Task
                  </h3>

                  {/* Form */}
                  <form
                    onSubmit={handleTaskSubmit}
                    className="space-y-4 text-xs"
                  >

                    {/* Task Name */}
                    <div>
                      <label className="block font-semibold text-gray-400 mb-1">
                        Task Name
                      </label>

                      <input
                        type="text"
                        placeholder="Draft Backend Schemas and Models"
                        className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={taskForm.name}
                        onChange={(e) =>
                          setTaskForm({
                            ...taskForm,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* AI Checkbox */}
                    <div className="flex items-center gap-2 py-1">

                      <input
                        type="checkbox"
                        id="aiCheck"
                        checked={taskForm.generateWithAI}
                        onChange={(e) =>
                          setTaskForm({
                            ...taskForm,
                            generateWithAI: e.target.checked,
                          })
                        }
                       className="rounded border-[#1e2e4f]/40 bg-gray-900 text-blue-500 focus:ring-0 cursor-pointer"
                      />

                      <label
                        htmlFor="aiCheck"
                        className="font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                      >
                        Auto-generate task description using AI
                      </label>

                    </div>

                    {/* Manual Description */}
                    {!taskForm.generateWithAI && (
                      <div>
                        <label className="block font-semibold text-gray-400 mb-1">
                          Description
                        </label>

                        <textarea
                          rows={3}
                          placeholder="Enter manual task specifications..."
                         className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                          value={taskForm.description}
                          onChange={(e) =>
                            setTaskForm({
                              ...taskForm,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                    )}

                    {/* Tech Stack + Priority */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      <div>
                        <label className="block font-semibold text-gray-400 mb-1">
                          Target Tech Stack
                        </label>

                        <input
                          type="text"
                          placeholder="Mongoose, Node.js"
                          className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={taskForm.techStack}
                          onChange={(e) =>
                            setTaskForm({
                              ...taskForm,
                              techStack: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-400 mb-1">
                          Priority
                        </label>

                        <select
                          className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={taskForm.priority}
                          onChange={(e) =>
                            setTaskForm({
                              ...taskForm,
                              priority: e.target.value,
                            })
                          }
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>

                    </div>

                    {/* Developer + Sprint */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      <div>
                        <label className="block font-semibold text-gray-400 mb-1">
                          Assign Developer
                        </label>

                        <select
                          className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={taskForm.assignedEmployee}
                          onChange={(e) =>
                            setTaskForm({
                              ...taskForm,
                              assignedEmployee: e.target.value,
                            })
                          }
                        >
                          <option value="">-- Choose Dev --</option>

                          {project.assignedEmployees?.map((dev) => (
                            <option key={dev._id} value={dev._id}>
                              {dev.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-400 mb-1">
                          Assign to Sprint
                        </label>

                        <select
                          className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={taskForm.sprint}
                          onChange={(e) =>
                            setTaskForm({
                              ...taskForm,
                              sprint: e.target.value,
                            })
                          }
                        >
                          <option value="">-- Choose Sprint --</option>

                          {sprints.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>

                    </div>

                    {/* Deadline */}
                    <div>
                      <label className="block font-semibold text-gray-400 mb-1">
                        Deadline Date
                      </label>

                      <input
                        type="date"
                        className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={taskForm.deadline}
                        onChange={(e) =>
                          setTaskForm({
                            ...taskForm,
                            deadline: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 justify-end pt-3 border-t border-[#1e2e4f]/25">

                      <button
                        type="button"
                        onClick={() => setTaskModalOpen(false)}
                        className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg font-semibold hover:bg-gray-700 cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 cursor-pointer"
                      >
                        Create
                      </button>

                    </div>

                  </form>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ========================================================
         MODAL: BUG CREATION
      ======================================================== */}
      {bugModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-9999 bg-black/70 backdrop-blur-sm">

            {/* Full screen scroll area */}
            <div className="absolute inset-0 overflow-y-auto">

              {/* Center modal */}
              <div className="min-h-full flex items-center justify-center p-4">

                <div
                  className="w-full max-w-2xl bg-[#0d1627] rounded-2xl border border-[#1e2e4f]/50 shadow-2xl p-6"
                >

                  {/* Header */}
                  <h3 className="text-base font-bold text-gray-200 border-b border-[#1e2e4f]/25 pb-3 mb-4">
                    Log Bug Ticket
                  </h3>

                  {/* Form */}
                  <form
                    onSubmit={handleBugSubmit}
                    className="space-y-4 text-xs"
                  >

                    {/* Bug Title */}
                    <div>
                      <label className="block font-semibold text-gray-400 mb-1">
                        Bug Title / Issue
                      </label>

                      <input
                        type="text"
                        placeholder="JWT validation fails intermittently on Dashboard refresh"
                        className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={bugForm.name}
                        onChange={(e) =>
                          setBugForm({
                            ...bugForm,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block font-semibold text-gray-400 mb-1">
                        Defect Description
                      </label>

                      <textarea
                        rows={3}
                        placeholder="Provide logs, error codes, and instructions to reproduce..."
                        className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        value={bugForm.description}
                        onChange={(e) =>
                          setBugForm({
                            ...bugForm,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Severity + Priority */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      {/* Severity */}
                      <div>
                        <label className="block font-semibold text-gray-400 mb-1">
                          Severity
                        </label>

                        <select
                          className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={bugForm.severity}
                          onChange={(e) =>
                            setBugForm({
                              ...bugForm,
                              severity: e.target.value as any,
                            })
                          }
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>

                      {/* Priority */}
                      <div>
                        <label className="block font-semibold text-gray-400 mb-1">
                          Priority
                        </label>

                        <select
                          className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={bugForm.priority}
                          onChange={(e) =>
                            setBugForm({
                              ...bugForm,
                              priority: e.target.value as any,
                            })
                          }
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>

                    </div>

                    {/* Developer + Sprint */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      {/* Developer */}
                      <div>
                        <label className="block font-semibold text-gray-400 mb-1">
                          Assign Developer
                        </label>

                        <select
                          className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={bugForm.assignedEmployee}
                          onChange={(e) =>
                            setBugForm({
                              ...bugForm,
                              assignedEmployee: e.target.value,
                            })
                          }
                        >
                          <option value="">-- Choose Dev --</option>

                          {project.assignedEmployees?.map((dev) => (
                            <option key={dev._id} value={dev._id}>
                              {dev.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Sprint */}
                      <div>
                        <label className="block font-semibold text-gray-400 mb-1">
                          Sprint Context
                        </label>

                        <select
                          className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={bugForm.sprint}
                          onChange={(e) =>
                            setBugForm({
                              ...bugForm,
                              sprint: e.target.value,
                            })
                          }
                        >
                          <option value="">-- Choose Sprint --</option>

                          {sprints.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>

                    </div>

                    {/* Deadline */}
                    <div>
                      <label className="block font-semibold text-gray-400 mb-1">
                        Deadline Date
                      </label>

                      <input
                        type="date"
                        className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={bugForm.deadline}
                        onChange={(e) =>
                          setBugForm({
                            ...bugForm,
                            deadline: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 justify-end pt-3 border-t border-[#1e2e4f]/25">

                      <button
                        type="button"
                        onClick={() => setBugModalOpen(false)}
                        className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg font-semibold hover:bg-gray-700 cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 cursor-pointer"
                      >
                        Submit Report
                      </button>

                    </div>

                  </form>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ========================================================
        MODAL OVERLAY: TASK / BUG DETAILS & DISCUSSION PANEL
       ======================================================== */}
      {(selectedTask || selectedBug) &&
        createPortal(
          <div className="fixed inset-0 z-9999 bg-black/75 backdrop-blur-md">

            {/* Full screen scroll container */}
            <div className="absolute inset-0 overflow-y-auto">

              {/* Center modal */}
              <div className="min-h-full flex items-center justify-center p-4">

                <div
                  className="w-full max-w-4xl min-h-150 max-h-[calc(100vh-32px)] bg-[#090e1a] rounded-2xl border border-[#1e2e4f]/60 shadow-2xl flex flex-col md:flex-row overflow-hidden"
                >

                  {/* ====================================================
                    LEFT SIDE: ITEM DETAILS & WORKFLOW
                  ==================================================== */}
                  <div
                    className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto border-b md:border-b-0 md:border-r border-[#1e2e4f]/30 text-xs"
                  >

                    <div className="space-y-4">

                      {/* Header */}
                      <div className="flex items-center justify-between">

                        <span
                          className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-blue-950/40 text-blue-400 border border-blue-900/40"
                        >
                          {selectedTask
                            ? "Task Ticket"
                            : "Defect Bug Ticket"}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTask(null);
                            setSelectedBug(null);
                            setMessages([]);
                          }}
                          className="text-gray-500 hover:text-gray-300 text-sm font-bold cursor-pointer"
                        >
                          ✕ Close
                        </button>

                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-gray-100">
                        {selectedTask
                          ? selectedTask.name
                          : selectedBug?.name}
                      </h3>

                      {/* Description */}
                      <div
                        className="bg-[#060b13] p-4 border border-gray-800 rounded-lg font-mono text-[11px] text-gray-300 whitespace-pre-line leading-relaxed max-h-55 overflow-y-auto"
                      >
                        {selectedTask
                          ? selectedTask.description
                          : selectedBug?.description}
                      </div>

                      {/* Details */}
                      <div className="space-y-2 border-t border-[#1e2e4f]/15 pt-3">

                        {/* Status */}
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-500">
                            Current Status:
                          </span>

                          <span className="font-bold text-blue-400 capitalize text-right">
                            {selectedTask
                              ? selectedTask.status.replace("_", " ")
                              : selectedBug?.status}
                          </span>
                        </div>

                        {/* Date */}
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-500">
                            Target Date:
                          </span>

                          <span className="text-gray-300 font-semibold font-mono text-right">
                            {new Date(
                              selectedTask
                                ? selectedTask.deadline
                                : selectedBug?.deadline || ""
                            ).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Assignee */}
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-500">
                            Team Assignee:
                          </span>

                          <span className="text-gray-300 font-semibold text-right">
                            {selectedTask
                              ? selectedTask.assignedEmployee?.name
                              : selectedBug?.assignedEmployee?.name ||
                              "Unassigned"}
                          </span>
                        </div>

                        {/* Reported By */}
                        {selectedBug && (
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-500">
                              Reported By:
                            </span>

                            <span className="text-gray-300 font-semibold text-right">
                              {selectedBug.reportedBy?.name}
                            </span>
                          </div>
                        )}

                      </div>
                    </div>

                    {/* ====================================================
                       STATUS WORKFLOW
                     ==================================================== */}
                    <div className="border-t border-[#1e2e4f]/15 pt-4 mt-6 space-y-2">

                      <span className="block font-semibold text-gray-500 mb-1">
                        Transition Workflow Stage:
                      </span>

                      <div className="grid grid-cols-2 gap-2">

                        {[
                          "todo",
                          "in_progress",
                          "testing",
                          "done",
                        ].map((st) => {

                          const active = selectedTask
                            ? selectedTask.status === st
                            : selectedBug?.status === st;

                          const stLabel =
                            st === "todo"
                              ? "To Do"
                              : st === "in_progress"
                                ? "In Progress"
                                : st === "testing"
                                  ? "Testing"
                                  : "Done";

                          return (
                            <button
                              type="button"
                              key={st}
                              onClick={() =>
                                handleStatusTransition(
                                  selectedTask
                                    ? selectedTask._id
                                    : selectedBug?._id || "",
                                  selectedTask ? "task" : "bug",
                                  st
                                )
                              }
                              className={`py-2 rounded-lg font-bold transition-all cursor-pointer border ${active
                                ? "bg-blue-600 border-blue-500 text-white"
                                : "bg-[#0b0f19] hover:bg-gray-800 border-gray-800 text-gray-400"
                                }`}
                            >
                              {stLabel}
                            </button>
                          );
                        })}

                      </div>
                    </div>
                  </div>

                  {/* ====================================================
                   RIGHT SIDE: DISCUSSION PANEL
                  ==================================================== */}
                  <div
                    className="w-full md:w-1/2 flex flex-col h-125 md:h-auto bg-[#070b14]"
                  >

                    {/* Discussion Header */}
                    <div
                      className="p-4 border-b border-[#1e2e4f]/30 flex items-center justify-between bg-[#0a101f] shrink-0"
                    >
                      <div>
                        <h4 className="font-bold text-xs text-gray-200">
                          Discussion Panel
                        </h4>

                        <span className="text-[10px] text-gray-500">
                          Clarify requirements & share updates
                        </span>
                      </div>

                      <span className="text-sm">
                        💬
                      </span>
                    </div>

                    {/* Message History */}
                    <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-4">

                      {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-gray-600 italic text-center">
                          No messages posted. Share files or text updates below.
                        </div>
                      ) : (
                        messages.map((msg) => (
                          <div
                            key={msg._id}
                            className={`flex flex-col text-[11px] max-w-[85%] ${msg.sender?._id === user?._id
                              ? "ml-auto items-end"
                              : "mr-auto items-start"
                              }`}
                          >

                            {/* Sender */}
                            <div className="flex items-center gap-1.5 mb-1 text-[10px] text-gray-500">

                              <span className="font-bold text-gray-300">
                                {msg.sender?.name}
                              </span>

                              <span
                                className="capitalize text-[8px] bg-gray-800 px-1 py-0.5 rounded text-gray-400"
                              >
                                {msg.sender?.role.replace("_", " ")}
                              </span>

                            </div>

                            {/* Message */}
                            <div
                              className={`p-3 rounded-xl border text-gray-200 leading-relaxed shadow-sm break-all ${msg.sender?._id === user?._id
                                ? "bg-blue-950/20 border-blue-900/40 rounded-tr-none text-right"
                                : "bg-gray-900/40 border-gray-800 rounded-tl-none"
                                }`}
                            >
                              <p>{msg.message}</p>

                              {msg.fileUrl && (
                                <div className="mt-2 pt-2 border-t border-gray-800/40 flex items-center gap-2">

                                  <span className="text-xs">
                                    📎
                                  </span>

                                  <a
                                    href={`http://localhost:5000${msg.fileUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                   className="text-blue-400 hover:underline font-semibold font-mono truncate max-w-37.5"
                                  >
                                    {msg.fileName || "View Attachment"}
                                  </a>

                                </div>
                              )}
                            </div>

                            {/* Time */}
                            <span className="text-[8px] text-gray-600 mt-1 font-mono">
                              {new Date(
                                msg.createdAt
                              ).toLocaleTimeString()}
                            </span>

                          </div>
                        ))
                      )}

                    </div>

                    {/* ====================================================
                     CHAT INPUT
                    ==================================================== */}
                    <form
                      onSubmit={handleSendMessage}
                      className="p-3 border-t border-[#1e2e4f]/35 bg-[#0a101f] text-xs shrink-0"
                    >

                      {/* Attached File */}
                      {attachedFile && (
                        <div
                         className="px-2.5 py-1.5 bg-blue-950/20 border border-blue-900/40 rounded-lg mb-2 flex items-center justify-between text-[10px] text-blue-300"
                        >
                          <span className="truncate max-w-50">
                            📎 File Selected: {attachedFile.name}
                          </span>

                          <button
                            type="button"
                            onClick={() => setAttachedFile(null)}
                            className="text-red-400 hover:text-red-300 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      )}

                      <div className="flex gap-2 items-center">

                        {/* File Upload */}
                        <label
                          className="h-9 w-9 shrink-0 bg-gray-900 border border-gray-800 hover:bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer text-lg filter hover:brightness-110"
                        >

                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              if (
                                e.target.files &&
                                e.target.files[0]
                              ) {
                                setAttachedFile(
                                  e.target.files[0]
                                );
                              }
                            }}
                          />
                        </label>

                        {/* Message Input */}
                        <input
                          type="text"
                          placeholder="Type an update or clarify requirement details..."
                          className="flex-1 min-w-0 px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none h-9 text-xs"
                          value={typedMessage}
                          onChange={(e) =>
                            setTypedMessage(e.target.value)
                          }
                        />

                        {/* Send */}
                        <button
                          type="submit"
                          disabled={uploadingAttachment}
                          className="h-9 px-4 shrink-0 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-all cursor-pointer text-xs"
                        >
                          {uploadingAttachment
                            ? "Uploading..."
                            : "Send"}
                        </button>

                      </div>
                    </form>
                  </div>

                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default ProjectDetails;
