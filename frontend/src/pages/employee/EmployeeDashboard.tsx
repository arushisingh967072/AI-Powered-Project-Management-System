import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import toast from "react-hot-toast";
import {
  FiClipboard,
  FiClock,
  FiAlertCircle,
  FiActivity,
  FiArrowRight,
} from "react-icons/fi";

interface Project {
  _id: string;
  name: string;
  description: string;
  priority: string;
  status: string;
  projectManager?: { name: string };
  assignedEmployees: any[];
}

interface TaskBugSummary {
  tasksCount: number;
  bugsCount: number;
  pendingTasks: number;
  pendingBugs: number;
}

const EmployeeDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [summary, setSummary] = useState<TaskBugSummary>({ tasksCount: 0, bugsCount: 0, pendingTasks: 0, pendingBugs: 0 });
  const [loading, setLoading] = useState(true);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      // Fetch projects assigned to employee
      const projRes = await API.get("/projects");
      if (projRes.data.success) {
        setProjects(projRes.data.projects);

        // Fetch task and bug statistics for these projects
        let totalTasks = 0;
        let pendingTasks = 0;
        let totalBugs = 0;
        let pendingBugs = 0;

        for (const proj of projRes.data.projects) {
          const tRes = await API.get(`/tasks/project/${proj._id}?assignedToMe=true`);
          if (tRes.data.success) {
            totalTasks += tRes.data.count;
            pendingTasks += tRes.data.tasks.filter((t: any) => t.status !== "done").length;
          }

          const bRes = await API.get(`/bugs/project/${proj._id}?assignedToMe=true`);
          if (bRes.data.success) {
            totalBugs += bRes.data.count;
            pendingBugs += bRes.data.bugs.filter((b: any) => b.status !== "done").length;
          }
        }

        setSummary({
          tasksCount: totalTasks,
          bugsCount: totalBugs,
          pendingTasks,
          pendingBugs,
        });
      }
    } catch (error) {
      toast.error("Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Assigned Tasks",
      value: summary.tasksCount,
      icon: FiClipboard,
      color: "from-blue-600/25 to-blue-800/10 text-blue-400",
    },
    {
      label: "Pending Tasks",
      value: summary.pendingTasks,
      icon: FiClock,
      color: "from-amber-600/25 to-amber-800/10 text-amber-400",
    },
    {
      label: "Assigned Bugs",
      value: summary.bugsCount,
      icon: FiAlertCircle,
      color: "from-red-600/25 to-red-800/10 text-red-400",
    },
    {
      label: "Pending Bugs",
      value: summary.pendingBugs,
      icon: FiActivity,
      color: "from-rose-600/25 to-rose-800/10 text-rose-400",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stat Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;

          return (
            <div
              key={idx}
              className={`glass-card rounded-2xl p-5 border border-[#1e2e4f]/35 bg-linear-to-br ${card.color} flex items-center justify-between shadow-md`}
            >
              <div>
                <p className="text-sm text-gray-400 font-medium">
                  {card.label}
                </p>

                <p className="text-2xl font-bold text-gray-100 mt-2">
                  {card.value}
                </p>
              </div>

              <div className="h-11 w-11 rounded-xl bg-gray-900/40 flex items-center justify-center">
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Projects Grid */}
      <div>
        <h3 className="text-lg font-bold text-gray-200 mb-4">Assigned Projects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full glass-card p-12 text-center text-gray-500 rounded-2xl italic border border-[#1e2e4f]/20">
              No projects currently assigned to you.
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
                          : "bg-blue-950/40 text-blue-400 border border-blue-900/30"
                        }`}
                    >
                      {proj.priority} Priority
                    </span>
                    <span className="text-xs text-gray-500 font-semibold uppercase">{proj.status}</span>
                  </div>

                  <h4 className="text-base font-bold text-gray-100 truncate mb-1">{proj.name}</h4>
                  <p className="text-xs text-gray-400 line-clamp-3 mb-4 leading-relaxed">
                    {proj.description}
                  </p>

                  <div className="text-xs space-y-2 border-t border-[#1e2e4f]/15 pt-3 mb-4 text-gray-400">
                    <div className="flex justify-between">
                      <span>Project Manager:</span>
                      <span className="font-semibold text-blue-400">{proj.projectManager?.name || "None"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1e2e4f]/15">
                  <Link
                    to={`/project/${proj._id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
                  >
                    <span>Enter Workstation</span>
                    <FiArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
