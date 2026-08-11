import React from "react";
import type { Project } from "../../../types";

interface SRSTabProps {
  project: Project;
  isPM: boolean;
  handleGenerateSRS: () => void;
}

export const SRSTab: React.FC<SRSTabProps> = ({ project, isPM, handleGenerateSRS }) => {
  return (
    <div className="glass-card rounded-2xl p-8 border border-[#1e2e4f]/35 space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2e4f]/20 pb-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-100">Software Requirements Specification</h3>
          <p className="text-xs text-gray-550">Workspace ready for API / LangChain integration</p>
        </div>
        {isPM && (
          <button
            onClick={handleGenerateSRS}
            className="px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
          >
            ⚡ Generate SRS
          </button>
        )}
      </div>

      <div className="p-12 text-center text-gray-500 italic border border-dashed border-[#1e2e4f]/30 rounded-xl">
        {project.srsDocument?.introduction?.purpose ? (
          <div className="text-left not-italic font-sans text-sm text-gray-300">
            <p className="font-semibold text-gray-200 mb-2">Generated Status:</p>
            <p>{project.srsDocument.introduction.purpose}</p>
          </div>
        ) : (
          "SRS Document Editor. Ready for your custom LangChain or AI API integration."
        )}
      </div>
    </div>
  );
};

export default SRSTab;
