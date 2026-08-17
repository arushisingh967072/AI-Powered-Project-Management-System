import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation, Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import API from "../services/api";

const formatRole = (role: string): string => {
  if (!role) return "";
  return role.replace(/_/g, " ");
};
import {
  FiBarChart2,
  FiUsers,
  FiFolder,
  FiBriefcase,
  FiClipboard,
  FiZap,
  FiLogOut,
  FiSearch,
  FiCheckSquare,
  FiAlertCircle,
  FiTrendingUp,
} from "react-icons/fi";

const DashboardLayout: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    projects: any[];
    employees: any[];
    tasks: any[];
    bugs: any[];
  } | null>(null);
  const [searching, setSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Change password modal states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setUpdatingPassword(true);
    try {
      await updateProfile({ password: newPassword });
      toast.success("Password changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password. Please try again.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setDropdownOpen(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      setDropdownOpen(true);
      try {
        const response = await API.get(`/search?q=${encodeURIComponent(searchQuery)}`);
        if (response.data?.success) {
          setSearchResults(response.data);
        } else {
          setSearchResults(null);
        }
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults(null);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectResult = (path: string) => {
    setDropdownOpen(false);
    setSearchQuery("");
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err: any) {
      toast.error("Logout failed");
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ==========================================
  // Navigation Links
  // ==========================================

  const getNavLinks = () => {
    switch (user.role) {
      case "admin":
        return [
          {
            to: "/admin",
            label: "Dashboard",
            icon: FiBarChart2,
          },
          {
            to: "/admin/employees",
            label: "Employee Management",
            icon: FiUsers,
          },
          {
            to: "/admin/projects",
            label: "Project Management",
            icon: FiFolder,
          },
          {
            to: "/admin/analytics",
            label: "Analytics",
            icon: FiTrendingUp,
          },
        ];

      case "project_manager":
        return [
          {
            to: "/pm",
            label: "PM Dashboard",
            icon: FiBriefcase,
          },
          {
            to: "/pm/analytics",
            label: "Analytics",
            icon: FiTrendingUp,
          },
        ];

      case "employee":
        return [
          {
            to: "/employee",
            label: "My Tasks & Bugs",
            icon: FiClipboard,
          },
          {
            to: "/employee/analytics",
            label: "Analytics",
            icon: FiTrendingUp,
          },
        ];

      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="flex h-screen bg-[#080d1a] overflow-hidden text-[#e2e8f0]">
      {/* ==========================================
          Sidebar
      ========================================== */}
      <aside className="w-64 bg-[#0d1527] border-r border-[#1e2e4f]/40 flex flex-col justify-between z-10 shrink-0">
        <div>
          {/* Logo */}
          <div className="p-5 border-b border-[#1e2e4f]/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <FiZap className="text-white" size={21} />
              </div>
              <h2 className="font-bold text-lg text-white">ProjectFlow</h2>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {navLinks.map((link) => {
              const isActive =
                link.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(link.to);

              const Icon = link.icon;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600/15 text-blue-400 border-l-4 border-blue-500 font-medium"
                      : "text-gray-400 hover:bg-gray-800/40 hover:text-gray-200"
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ==========================================
            User Card
        ========================================== */}
        <div className="p-4 border-t border-[#1e2e4f]/30 space-y-2">
          <Link
            to="/profile"
            className={`flex items-center gap-3 p-2 rounded-xl transition-all hover:bg-gray-800/45 ${
              location.pathname === "/profile" ? "bg-gray-800/40" : ""
            }`}
          >
            <div className="h-10 w-10 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="overflow-hidden">
              <h4 className="font-medium text-sm text-gray-200 truncate leading-none mb-1">
                {user.name}
              </h4>
              <p className="text-[10px] text-gray-500 capitalize">
                {formatRole(user.role)}
              </p>
            </div>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-950/20 hover:bg-red-950/40 text-red-400 text-xs font-semibold rounded-lg border border-red-900/30 transition-all cursor-pointer"
          >
            <FiLogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ==========================================
          Main Content
      ========================================== */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-[#1e2e4f]/30 flex items-center justify-between px-8 bg-[#0a1122]">
          <h1 className="text-xl font-bold bg-linear-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
            {location.pathname.startsWith("/admin")
              ? "Administrator Portal"
              : location.pathname.startsWith("/pm")
              ? "Project Manager Workspace"
              : location.pathname.startsWith("/profile")
              ? "Account Profile"
              : "Employee Workstation"}
          </h1>

          <div className="flex items-center gap-6 flex-1 justify-end max-w-3xl">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-xl mx-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" size={16} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim()) {
                    setDropdownOpen(true);
                  }
                }}
                placeholder="Search projects, tasks, bugs..."
                className="w-full pl-9 pr-4 py-1.5 bg-[#0d1527] border border-[#1e2e4f]/40 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/80 transition-all duration-200"
              />

              {dropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute left-0 right-0 mt-2 bg-[#0d1527] border border-[#1e2e4f]/40 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto backdrop-blur-md divide-y divide-[#1e2e4f]/20 scrollbar-thin"
                >
                  {searching && (
                    <div className="p-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                      Searching...
                    </div>
                  )}

                  {!searching && searchResults && (
                    <>
                      {/* Projects Section */}
                      {searchResults.projects && searchResults.projects.length > 0 && (
                        <div className="p-3">
                          <h5 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2 px-2 flex items-center gap-1.5">
                            <FiFolder size={12} className="text-blue-400" /> Projects
                          </h5>
                          <div className="space-y-1">
                            {searchResults.projects.map((proj: any) => (
                              <button
                                key={proj._id}
                                onClick={() => handleSelectResult(`/project/${proj._id}`)}
                                className="w-full text-left p-2 rounded-xl hover:bg-gray-800/40 transition-all flex justify-between items-center gap-2 group cursor-pointer"
                              >
                                <div className="truncate">
                                  <div className="text-xs font-semibold text-gray-200 group-hover:text-blue-400 transition-colors truncate text-left">
                                    {proj.name}
                                  </div>
                                  <div className="text-[10px] text-gray-500 truncate mt-0.5 text-left">
                                    {proj.description}
                                  </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase shrink-0 ${
                                  proj.priority === "high" ? "bg-red-950/40 text-red-400 border border-red-900/30" :
                                  proj.priority === "medium" ? "bg-amber-950/40 text-amber-400 border border-amber-900/30" :
                                  "bg-green-950/40 text-green-400 border border-green-900/30"
                                }`}>
                                  {proj.priority}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tasks Section */}
                      {searchResults.tasks && searchResults.tasks.length > 0 && (
                        <div className="p-3">
                          <h5 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2 px-2 flex items-center gap-1.5">
                            <FiCheckSquare size={12} className="text-emerald-400" /> Tasks
                          </h5>
                          <div className="space-y-1">
                            {searchResults.tasks.map((task: any) => (
                              <button
                                key={task._id}
                                onClick={() => handleSelectResult(`/project/${task.project?._id}?tab=tasks`)}
                                className="w-full text-left p-2 rounded-xl hover:bg-gray-800/40 transition-all flex justify-between items-center gap-2 group cursor-pointer"
                              >
                                <div className="truncate">
                                  <div className="text-xs font-semibold text-gray-200 group-hover:text-emerald-400 transition-colors truncate text-left">
                                    {task.name}
                                  </div>
                                  <div className="text-[10px] text-gray-500 truncate mt-0.5 text-left">
                                    Project: {task.project?.name || "N/A"}
                                  </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase shrink-0 ${
                                  task.status === "done" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30" :
                                  task.status === "testing" ? "bg-purple-950/40 text-purple-400 border border-purple-900/30" :
                                  task.status === "in_progress" ? "bg-blue-950/40 text-blue-400 border border-blue-900/30" :
                                  "bg-gray-850/40 text-gray-400 border border-gray-700/30"
                                }`}>
                                  {task.status.replace("_", " ")}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bugs Section */}
                      {searchResults.bugs && searchResults.bugs.length > 0 && (
                        <div className="p-3">
                          <h5 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2 px-2 flex items-center gap-1.5">
                            <FiAlertCircle size={12} className="text-rose-400" /> Bugs
                          </h5>
                          <div className="space-y-1">
                            {searchResults.bugs.map((bug: any) => (
                              <button
                                key={bug._id}
                                onClick={() => handleSelectResult(`/project/${bug.project?._id}?tab=bugs`)}
                                className="w-full text-left p-2 rounded-xl hover:bg-gray-800/40 transition-all flex justify-between items-center gap-2 group cursor-pointer"
                              >
                                <div className="truncate">
                                  <div className="text-xs font-semibold text-gray-200 group-hover:text-rose-400 transition-colors truncate text-left">
                                    {bug.name}
                                  </div>
                                  <div className="text-[10px] text-gray-500 truncate mt-0.5 text-left">
                                    Project: {bug.project?.name || "N/A"}
                                  </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase shrink-0 ${
                                  bug.severity === "critical" ? "bg-rose-950/60 text-rose-300 border border-rose-800/40" :
                                  bug.severity === "high" ? "bg-red-950/40 text-red-400 border border-red-900/30" :
                                  bug.severity === "medium" ? "bg-amber-950/40 text-amber-400 border border-amber-900/30" :
                                  "bg-green-950/40 text-green-400 border border-green-900/30"
                                }`}>
                                  {bug.severity}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Employees Section */}
                      {searchResults.employees && searchResults.employees.length > 0 && (
                        <div className="p-3">
                          <h5 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2 px-2 flex items-center gap-1.5">
                            <FiUsers size={12} className="text-indigo-400" /> Team Members
                          </h5>
                          <div className="space-y-1">
                            {searchResults.employees.map((emp: any) => (
                              <button
                                key={emp._id}
                                onClick={() => handleSelectResult(user.role === "admin" ? "/admin/employees" : `/profile`)}
                                className="w-full text-left p-2 rounded-xl hover:bg-gray-800/40 transition-all flex items-center gap-3 group cursor-pointer"
                              >
                                <div className="h-7 w-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-[10px] text-indigo-300 shrink-0">
                                  {emp.profilePicture ? (
                                    <img
                                      src={emp.profilePicture}
                                      alt={emp.name}
                                      className="h-full w-full rounded-full object-cover"
                                    />
                                  ) : (
                                    emp.name.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <div className="truncate flex-1">
                                  <div className="text-xs font-semibold text-gray-200 group-hover:text-indigo-400 transition-colors truncate text-left">
                                    {emp.name}
                                  </div>
                                  <div className="text-[10px] text-gray-500 truncate text-left">
                                    {emp.email} • {emp.department || "No Dept"}
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-[#1e2e4f]/30 border border-[#1e2e4f]/40 text-[9px] text-gray-400 font-medium capitalize shrink-0">
                                  {emp.role.replace("_", " ")}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {searchResults.projects.length === 0 &&
                        searchResults.tasks.length === 0 &&
                        searchResults.bugs.length === 0 &&
                        searchResults.employees.length === 0 && (
                          <div className="p-4 text-center text-xs text-gray-400">
                            No results found for "{searchQuery}"
                          </div>
                        )}
                    </>
                  )}
                </div>
              )}
            </div>

            <span className="px-3 py-1 bg-blue-950/40 border border-blue-900/40 rounded-full text-xs text-blue-400 font-medium capitalize shrink-0">
              Role: {formatRole(user.role)}
            </span>

            {/* User Profile Info */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="h-8 w-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-xs text-indigo-300">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>

      {/* Force Change Password Modal */}
      {user?.shouldChangePassword && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d1627] rounded-2xl border border-[#1e2e4f]/50 shadow-2xl p-6 shadow-blue-500/5 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-100 mb-2">
              Update Your Password
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Your account has been created with a temporary password. For security, you must change your password before you can proceed to the dashboard.
            </p>

            {passwordError && (
              <div className="mb-4 p-2.5 bg-red-950/40 border border-red-800/40 text-red-300 text-xs rounded-lg">
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="w-full py-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingPassword ? "Updating Password..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
