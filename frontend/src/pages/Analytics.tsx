import React, { useState, useEffect } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FiBriefcase,
  FiFolder,
  FiAlertCircle,
  FiUsers,
} from "react-icons/fi";

const COLORS = ["#3b82f6", "#eab308", "#10b981", "#ef4444"];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[10px] font-bold"
    >
      {percent > 0 ? `${(percent * 100).toFixed(0)}%` : ""}
    </text>
  );
};

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await API.get("/analytics");
        if (response.data?.success) {
          setData(response.data.data);
        } else {
          setError("Failed to fetch analytics data");
        }
      } catch (err: any) {
        console.error("Error fetching analytics:", err);
        setError(err.response?.data?.message || "An error occurred while loading analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-red-500/20 text-center max-w-md mx-auto my-12">
        <FiAlertCircle className="text-red-500 mx-auto mb-4" size={40} />
        <h3 className="text-lg font-bold text-gray-200 mb-2">Analytics Error</h3>
        <p className="text-gray-400 text-sm">{error || "Data is unavailable"}</p>
      </div>
    );
  }

  // ==========================================
  // ADMIN RENDER
  // ==========================================
  if (user?.role === "admin") {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">System Analytics</h2>
          <p className="text-gray-400 text-sm">Real-time overview of the system activities and demographics.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 border border-[#1e2e4f]/30 bg-linear-to-br from-blue-600/25 to-blue-800/10 text-blue-400 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-sm text-gray-400 font-medium">Total Employees</p>
              <h3 className="text-3xl font-bold text-gray-100 mt-2">{data.summary.totalEmployees}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gray-900/40 flex items-center justify-center">
              <FiUsers size={24} />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-[#1e2e4f]/30 bg-linear-to-br from-purple-600/25 to-purple-800/10 text-purple-400 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-sm text-gray-400 font-medium">Project Managers</p>
              <h3 className="text-3xl font-bold text-gray-100 mt-2">{data.summary.totalManagers}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gray-900/40 flex items-center justify-center">
              <FiBriefcase size={24} />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-[#1e2e4f]/30 bg-linear-to-br from-emerald-600/25 to-emerald-800/10 text-emerald-400 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-sm text-gray-400 font-medium">Total Projects</p>
              <h3 className="text-3xl font-bold text-gray-100 mt-2">{data.summary.totalProjects}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gray-900/40 flex items-center justify-center">
              <FiFolder size={24} />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-[#1e2e4f]/30 bg-linear-to-br from-amber-600/25 to-amber-800/10 text-amber-400 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-sm text-gray-400 font-medium">Active Projects</p>
              <h3 className="text-3xl font-bold text-gray-100 mt-2">{data.summary.activeProjects}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gray-900/40 flex items-center justify-center">
              <FiBriefcase size={24} />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-[#1e2e4f]/30 bg-linear-to-br from-teal-600/25 to-teal-800/10 text-teal-400 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-sm text-gray-400 font-medium">Completed Projects</p>
              <h3 className="text-3xl font-bold text-gray-100 mt-2">{data.summary.completedProjects}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gray-900/40 flex items-center justify-center">
              <FiBriefcase size={24} />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-[#1e2e4f]/30 bg-linear-to-br from-indigo-600/25 to-indigo-800/10 text-indigo-400 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-sm text-gray-400 font-medium">Available Employees</p>
              <h3 className="text-3xl font-bold text-gray-100 mt-2">{data.summary.availableEmployees}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gray-900/40 flex items-center justify-center">
              <FiUsers size={24} />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Status Donut Chart */}
          <div className="glass-card p-6 rounded-2xl border border-[#1e2e4f]/30">
            <h4 className="text-sm font-bold text-gray-200 mb-4 uppercase tracking-wider">Project Status Distribution</h4>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.projectStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.projectStats.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0d1527",
                      borderColor: "rgba(30, 46, 79, 0.4)",
                      borderRadius: "12px",
                      color: "#e2e8f0",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs text-gray-400">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Task Status Donut Chart */}
          <div className="glass-card p-6 rounded-2xl border border-[#1e2e4f]/30">
            <h4 className="text-sm font-bold text-gray-200 mb-4 uppercase tracking-wider">Task Status Distribution</h4>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.taskStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.taskStats.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0d1527",
                      borderColor: "rgba(30, 46, 79, 0.4)",
                      borderRadius: "12px",
                      color: "#e2e8f0",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs text-gray-400">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Distribution Bar Chart */}
          <div className="glass-card p-6 rounded-2xl border border-[#1e2e4f]/30 lg:col-span-2">
            <h4 className="text-sm font-bold text-gray-200 mb-4 uppercase tracking-wider">Department Headcounts</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.departmentStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2e4f" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      backgroundColor: "#0d1527",
                      borderColor: "rgba(30, 46, 79, 0.4)",
                      borderRadius: "12px",
                      color: "#e2e8f0",
                    }}
                  />
                  <Bar dataKey="value" name="Employees" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PROJECT MANAGER RENDER
  // ==========================================
  if (user?.role === "project_manager") {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Workspace Analytics</h2>
          <p className="text-gray-400 text-sm">Visualize sprint progress, team load, and bug status metrics.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <div className="glass-card p-4 rounded-xl border border-[#1e2e4f]/30">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Projects</p>
            <h3 className="text-xl font-bold text-white mt-1">{data.summary.projectsManaged}</h3>
          </div>
          <div className="glass-card p-4 rounded-xl border border-[#1e2e4f]/30">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Tasks</p>
            <h3 className="text-xl font-bold text-white mt-1">{data.summary.totalTasks}</h3>
          </div>
          <div className="glass-card p-4 rounded-xl border border-[#1e2e4f]/30">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Bugs</p>
            <h3 className="text-xl font-bold text-white mt-1">{data.summary.totalBugs}</h3>
          </div>
          <div className="glass-card p-4 rounded-xl border border-[#1e2e4f]/30">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Tasks Done</p>
            <h3 className="text-xl font-bold text-emerald-400 mt-1">{data.summary.completedTasks}</h3>
          </div>
          <div className="glass-card p-4 rounded-xl border border-[#1e2e4f]/30">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Bugs Solved</p>
            <h3 className="text-xl font-bold text-blue-400 mt-1">{data.summary.resolvedBugs}</h3>
          </div>
        </div>

        {/* PM Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Status Donut Chart */}
          <div className="glass-card p-6 rounded-2xl border border-[#1e2e4f]/30">
            <h4 className="text-sm font-bold text-gray-200 mb-4 uppercase tracking-wider">Task Status Breakdown</h4>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.taskStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={renderCustomizedLabel}
                    labelLine={false}
                  >
                    {data.taskStats.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0d1527",
                      borderColor: "rgba(30, 46, 79, 0.4)",
                      borderRadius: "12px",
                      color: "#e2e8f0",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs text-gray-400">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bug Severity Donut Chart */}
          <div className="glass-card p-6 rounded-2xl border border-[#1e2e4f]/30">
            <h4 className="text-sm font-bold text-gray-200 mb-4 uppercase tracking-wider">Bug Severity Breakdown</h4>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.bugSeverityStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={renderCustomizedLabel}
                    labelLine={false}
                  >
                    {data.bugSeverityStats.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0d1527",
                      borderColor: "rgba(30, 46, 79, 0.4)",
                      borderRadius: "12px",
                      color: "#e2e8f0",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs text-gray-400">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Task Priority Bar Chart */}
          <div className="glass-card p-6 rounded-2xl border border-[#1e2e4f]/30 lg:col-span-2">
            <h4 className="text-sm font-bold text-gray-200 mb-4 uppercase tracking-wider">Task Workload by Priority</h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.taskPriorityStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2e4f" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      backgroundColor: "#0d1527",
                      borderColor: "rgba(30, 46, 79, 0.4)",
                      borderRadius: "12px",
                      color: "#e2e8f0",
                    }}
                  />
                  <Bar dataKey="value" name="Tasks Count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // EMPLOYEE RENDER
  // ==========================================
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">My Workload Analytics</h2>
        <p className="text-gray-400 text-sm">Overview of your task workload, completions, and project activities.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <div className="glass-card p-4 rounded-xl border border-[#1e2e4f]/30">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Assigned Tasks</p>
          <h3 className="text-xl font-bold text-white mt-1">{data.summary.assignedTasks}</h3>
        </div>
        <div className="glass-card p-4 rounded-xl border border-[#1e2e4f]/30">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Tasks Done</p>
          <h3 className="text-xl font-bold text-emerald-400 mt-1">{data.summary.completedTasks}</h3>
        </div>
        <div className="glass-card p-4 rounded-xl border border-[#1e2e4f]/30">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Pending Tasks</p>
          <h3 className="text-xl font-bold text-amber-500 mt-1">{data.summary.pendingTasks}</h3>
        </div>
        <div className="glass-card p-4 rounded-xl border border-[#1e2e4f]/30">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Assigned Bugs</p>
          <h3 className="text-xl font-bold text-rose-400 mt-1">{data.summary.assignedBugs}</h3>
        </div>
        <div className="glass-card p-4 rounded-xl border border-[#1e2e4f]/30">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Bugs Resolved</p>
          <h3 className="text-xl font-bold text-blue-400 mt-1">{data.summary.resolvedBugs}</h3>
        </div>
      </div>

      {/* Employee Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Task Status Donut Chart */}
        <div className="glass-card p-6 rounded-2xl border border-[#1e2e4f]/30">
          <h4 className="text-sm font-bold text-gray-200 mb-4 uppercase tracking-wider">My Tasks Status</h4>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.taskStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {data.taskStats.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d1527",
                    borderColor: "rgba(30, 46, 79, 0.4)",
                    borderRadius: "12px",
                    color: "#e2e8f0",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs text-gray-400">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Priority Distribution Donut Chart */}
        <div className="glass-card p-6 rounded-2xl border border-[#1e2e4f]/30">
          <h4 className="text-sm font-bold text-gray-200 mb-4 uppercase tracking-wider">My Tasks Priority</h4>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.taskPriorityStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {data.taskPriorityStats.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d1527",
                    borderColor: "rgba(30, 46, 79, 0.4)",
                    borderRadius: "12px",
                    color: "#e2e8f0",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs text-gray-400">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Workload Bar Chart */}
        {data.projectWorkloadStats && data.projectWorkloadStats.length > 0 && (
          <div className="glass-card p-6 rounded-2xl border border-[#1e2e4f]/30 lg:col-span-2">
            <h4 className="text-sm font-bold text-gray-200 mb-4 uppercase tracking-wider">My Workload by Projects</h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.projectWorkloadStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2e4f" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      backgroundColor: "#0d1527",
                      borderColor: "rgba(30, 46, 79, 0.4)",
                      borderRadius: "12px",
                      color: "#e2e8f0",
                    }}
                  />
                  <Legend verticalAlign="top" height={36} formatter={(value) => <span className="text-xs text-gray-400">{value}</span>} />
                  <Bar dataKey="Tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Bugs" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
