import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import toast from "react-hot-toast";
import { FiArrowRight } from "react-icons/fi";

interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  techStack: string[];
  assignedEmployees: any[];
}

const PMDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPMProjects = async () => {
    try {
      const response = await API.get("/projects");
      if (response.data.success) {
        setProjects(response.data.projects);
      }
    } catch (error) {
      toast.error("Failed to load assigned projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPMProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-200">My Projects</h2>
        <p className="text-xs text-gray-500 mt-1">Manage AI requirements engineering, sprint timelines, and tasks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center text-gray-500 rounded-2xl italic border border-[#1e2e4f]/20">
            No projects assigned to you by the Administrator.
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
                    className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                      proj.priority === "high"
                        ? "bg-red-950/40 text-red-400 border border-red-900/40"
                        : proj.priority === "medium"
                        ? "bg-yellow-950/40 text-yellow-400 border border-yellow-900/30"
                        : "bg-blue-950/40 text-blue-400 border border-blue-900/30"
                    }`}
                  >
                    {proj.priority} Priority
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                      proj.status === "completed"
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
                <p className="text-xs text-gray-400 line-clamp-3 mb-4 leading-relaxed">
                  {proj.description}
                </p>

                <div className="text-xs space-y-2 border-t border-[#1e2e4f]/15 pt-3 mb-4 text-gray-400">
                  <div className="flex justify-between">
                    <span>Assigned Team:</span>
                    <span className="font-semibold text-gray-300">
                      {proj.assignedEmployees?.length || 0} Developers
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1e2e4f]/15">
                <Link
  to={`/project/${proj._id}`}
  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
>
  <span>Open Project Workspace</span>
  <FiArrowRight size={14} />
</Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PMDashboard;
