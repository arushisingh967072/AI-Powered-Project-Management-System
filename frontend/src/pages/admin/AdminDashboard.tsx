import React, { useState, useEffect } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";
import {
  FiUsers,
  FiBriefcase,
  FiFolder,
  FiActivity,
  FiCheckCircle,
  FiStar,
} from "react-icons/fi";

interface Stats {
  totalEmployees: number;
  totalManagers: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  availableEmployees: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await API.get("/employees/admin-stats");
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
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
      label: "Total Employees",
      value: stats?.totalEmployees || 0,
      icon: FiUsers,
      color: "from-blue-600/25 to-blue-800/10 text-blue-400",
    },
    {
      label: "Project Managers",
      value: stats?.totalManagers || 0,
      icon: FiBriefcase,
      color: "from-purple-600/25 to-purple-800/10 text-purple-400",
    },
    {
      label: "Total Projects",
      value: stats?.totalProjects || 0,
      icon: FiFolder,
      color: "from-emerald-600/25 to-emerald-800/10 text-emerald-400",
    },
    {
      label: "Active Projects",
      value: stats?.activeProjects || 0,
      icon: FiActivity,
      color: "from-amber-600/25 to-amber-800/10 text-amber-400",
    },
    {
      label: "Completed Projects",
      value: stats?.completedProjects || 0,
      icon: FiCheckCircle,
      color: "from-teal-600/25 to-teal-800/10 text-teal-400",
    },
    {
      label: "Available Employees",
      value: stats?.availableEmployees || 0,
      icon: FiStar,
      color: "from-indigo-600/25 to-indigo-800/10 text-indigo-400",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;

          return (
            <div
              key={idx}
              className={`glass-card rounded-2xl p-6 border border-[#1e2e4f]/30 bg-linear-to-br ${card.color} flex items-center justify-between shadow-lg`}
            >
              <div>
                <p className="text-sm text-gray-400 font-medium">
                  {card.label}
                </p>

                <p className="text-3xl font-bold text-gray-100 mt-2">
                  {card.value}
                </p>
              </div>

              <div className="h-12 w-12 rounded-xl bg-gray-900/40 flex items-center justify-center">
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick info pane */}
        <div className="glass-card rounded-2xl p-6 border border-[#1e2e4f]/30">
          <h3 className="text-lg font-bold text-gray-200 mb-4">Organizational Health</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-400">Project Completion Velocity</span>
                <span className="text-blue-400">
                  {stats?.totalProjects
                    ? Math.round(((stats.completedProjects || 0) / stats.totalProjects) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats?.totalProjects
                        ? ((stats.completedProjects || 0) / stats.totalProjects) * 100
                        : 0
                      }%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-400">Active Staff Engagement</span>
                <span className="text-purple-400">
                  {stats?.totalEmployees
                    ? Math.round(
                      ((stats.totalEmployees - (stats.availableEmployees || 0)) /
                        stats.totalEmployees) *
                      100
                    )
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats?.totalEmployees
                        ? ((stats.totalEmployees - (stats.availableEmployees || 0)) /
                          stats.totalEmployees) *
                        100
                        : 0
                      }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend block */}
        <div className="glass-card rounded-2xl p-6 border border-[#1e2e4f]/30 flex flex-col justify-center">
          <h3 className="text-lg font-bold text-gray-200 mb-2">Administrative Guidelines</h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            As an Administrator, you register core project outlines and initialize employee records. Project Managers will take over milestones, planning, and requirements engineering using AI automation.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1 bg-blue-950/40 border border-blue-900/40 rounded-lg text-xs text-blue-400 font-medium">
              Assign PMs to Projects
            </span>
            <span className="px-3 py-1 bg-purple-950/40 border border-purple-900/40 rounded-lg text-xs text-purple-400 font-medium">
              Create Dev Accounts
            </span>
            <span className="px-3 py-1 bg-emerald-950/40 border border-emerald-900/40 rounded-lg text-xs text-emerald-400 font-medium">
              Monitor Deliverables
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
