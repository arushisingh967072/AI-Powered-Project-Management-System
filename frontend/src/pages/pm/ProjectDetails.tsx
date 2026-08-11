import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import toast from "react-hot-toast";
import type { Project, Sprint, Task, Bug, DiscussionMessage } from "../../types";

// Import modular project details tab views
import OverviewTab from "./project-details/OverviewTab";
import SRSTab from "./project-details/SRSTab";
import SprintsTab from "./project-details/SprintsTab";
import TasksTab from "./project-details/TasksTab";
import BugsTab from "./project-details/BugsTab";
import ReportTab from "./project-details/ReportTab";

// Import modular project details modal overlays
import SprintModal from "./project-details/SprintModal";
import TaskModal from "./project-details/TaskModal";
import BugModal from "./project-details/BugModal";
import DetailModal from "./project-details/DetailModal";

const ProjectDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  // Tab State
  const [activeTab, setActiveTab] = useState<"overview" | "srs" | "sprints" | "tasks" | "bugs" | "report">(
    (tabParam && ["overview", "srs", "sprints", "tasks", "bugs", "report"].includes(tabParam))
      ? (tabParam as any)
      : "overview"
  );

  useEffect(() => {
    if (tabParam && ["overview", "srs", "sprints", "tasks", "bugs", "report"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  const handleTabChange = (tab: "overview" | "srs" | "sprints" | "tasks" | "bugs" | "report") => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

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
            onClick={() => handleTabChange(tab)}
            className={`pb-3 font-semibold capitalize transition-all border-b-2 cursor-pointer ${
              activeTab === tab
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
        {activeTab === "overview" && <OverviewTab project={project} />}
        {activeTab === "srs" && (
          <SRSTab project={project} isPM={isPM} handleGenerateSRS={handleGenerateSRS} />
        )}
        {activeTab === "sprints" && (
          <SprintsTab
            sprints={sprints}
            isPM={isPM}
            setSprintModalOpen={setSprintModalOpen}
            handleToggleSprintStatus={handleToggleSprintStatus}
          />
        )}
        {activeTab === "tasks" && (
          <TasksTab
            tasks={tasks}
            isPM={isPM}
            setTaskModalOpen={setTaskModalOpen}
            setSelectedTask={setSelectedTask}
          />
        )}
        {activeTab === "bugs" && (
          <BugsTab bugs={bugs} setBugModalOpen={setBugModalOpen} setSelectedBug={setSelectedBug} />
        )}
        {activeTab === "report" && (
          <ReportTab reportData={reportData} handleGenerateReport={handleGenerateReport} />
        )}
      </div>

      {/* Sprint Modal Overlay */}
      <SprintModal
        isOpen={sprintModalOpen}
        onClose={() => setSprintModalOpen(false)}
        sprintForm={sprintForm}
        setSprintForm={setSprintForm}
        onSubmit={handleSprintSubmit}
      />

      {/* Task Modal Overlay */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        project={project}
        sprints={sprints}
        taskForm={taskForm}
        setTaskForm={setTaskForm}
        onSubmit={handleTaskSubmit}
      />

      {/* Bug Modal Overlay */}
      <BugModal
        isOpen={bugModalOpen}
        onClose={() => setBugModalOpen(false)}
        project={project}
        sprints={sprints}
        bugForm={bugForm}
        setBugForm={setBugForm}
        onSubmit={handleBugSubmit}
      />

      {/* Detail & Discussion Modal Overlay */}
      <DetailModal
        user={user}
        selectedTask={selectedTask}
        setSelectedTask={setSelectedTask}
        selectedBug={selectedBug}
        setSelectedBug={setSelectedBug}
        messages={messages}
        setMessages={setMessages}
        typedMessage={typedMessage}
        setTypedMessage={setTypedMessage}
        attachedFile={attachedFile}
        setAttachedFile={setAttachedFile}
        uploadingAttachment={uploadingAttachment}
        handleStatusTransition={handleStatusTransition}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default ProjectDetails;
