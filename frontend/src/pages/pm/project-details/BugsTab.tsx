import React from "react";
import type { Bug } from "../../../types";
import { useAuth } from "../../../context/AuthContext";

interface BugsTabProps {
  bugs: Bug[];
  setBugModalOpen: (open: boolean) => void;
  setSelectedBug: (bug: Bug | null) => void;
}

export const BugsTab: React.FC<BugsTabProps> = ({
  bugs,
  setBugModalOpen,
  setSelectedBug,
}) => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-200">Active Software Defects</h3>
          <p className="text-xs text-gray-550 mt-1">Log issues, set priorities, and track bug fixes</p>
        </div>
        {user?.role !== "employee" && (
          <button
            onClick={() => setBugModalOpen(true)}
            className="px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
          >
            ➕ Log Bug Report
          </button>
        )}
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
                    className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                      bug.severity === "critical"
                        ? "bg-red-950/60 text-red-400 border border-red-900/60"
                        : bug.severity === "high"
                        ? "bg-orange-950/40 text-orange-400 border border-orange-900/30"
                        : "bg-blue-950/40 text-blue-400 border border-blue-900/30"
                    }`}
                  >
                    {bug.severity} Severity
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                      bug.status === "done"
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
  );
};

export default BugsTab;
