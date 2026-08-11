import React from "react";
import type { Sprint } from "../../../types";

const formatDate = (date: string | Date | undefined): string => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

interface SprintsTabProps {
  sprints: Sprint[];
  isPM: boolean;
  setSprintModalOpen: (open: boolean) => void;
  handleToggleSprintStatus: (id: string, status: string) => void;
}

export const SprintsTab: React.FC<SprintsTabProps> = ({
  sprints,
  isPM,
  setSprintModalOpen,
  handleToggleSprintStatus,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-200">Milestone Sprints</h3>
          <p className="text-xs text-gray-550 mt-1">Schedules and business targets mapping sprint deliverables</p>
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
                    className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                      s.status === "completed"
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40"
                        : "bg-blue-950/40 text-blue-400 border border-blue-900/40"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">{s.goal}</p>
                <div className="text-[11px] font-mono text-gray-500 space-y-1">
                  <div>Start: {formatDate(s.startDate)}</div>
                  <div>End: {formatDate(s.endDate)}</div>
                </div>
              </div>
              {isPM && (
                <button
                  onClick={() => handleToggleSprintStatus(s._id, s.status)}
                  className={`w-full mt-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                    s.status === "active"
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
  );
};

export default SprintsTab;
