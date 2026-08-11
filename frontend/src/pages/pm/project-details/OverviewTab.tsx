import React from "react";
import type { Project } from "../../../types";

interface OverviewTabProps {
  project: Project;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ project }) => {
  return (
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
  );
};

export default OverviewTab;
