
import React from "react";

const formatDate = (date: string | Date | undefined): string => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

interface ReportTabProps {
  reportData: any;
  handleGenerateReport: () => void;
}

export const ReportTab: React.FC<ReportTabProps> = ({
  reportData,
  handleGenerateReport,
}) => {
  return (
    <div className="glass-card rounded-2xl p-8 border border-[#1e2e4f]/35 space-y-6">
      <div className="flex items-center justify-between border-b border-[#1e2e4f]/25 pb-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-100">Project Telemetry Report</h3>
          <p className="text-xs text-gray-550">Exportable metrics detailing task schedules, sprint completions, and QA statistics</p>
        </div>
        <button
          onClick={handleGenerateReport}
          className="px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
        >
          📊 Generate Final Report
        </button>
      </div>

      {reportData ? (
        <div className="space-y-8 text-sm text-gray-300 leading-relaxed max-w-4xl bg-[#090e1a] p-8 border border-gray-800/80 rounded-xl shadow-inner font-sans">
          <div className="flex justify-between items-center text-xs text-gray-500 pb-4 border-b border-gray-800 mb-6">
            <span>Report ID: {reportData.project.id}</span>
            <button
              onClick={() => window.print()}
              className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 rounded text-[10px] text-gray-400 border border-gray-700 cursor-pointer"
            >
              🖨️ Export PDF
            </button>
          </div>

          <div className="text-center mb-6">
            <h4 className="text-xl font-bold text-gray-100 uppercase tracking-wide">
              Project Final Closeout Report
            </h4>
            <p className="text-xs text-gray-500 mt-1">Generated on: {formatDate(reportData.generatedAt)}</p>
          </div>

          {/* Project Overview Sheet */}
          <div className="grid grid-cols-2 gap-6 p-4 bg-gray-900/35 border border-gray-800/80 rounded-xl text-xs">
            <div>
              <span className="block text-gray-500 mb-1">Project Name:</span>
              <strong className="text-gray-200 text-sm">{reportData.project.name}</strong>
            </div>
            <div>
              <span className="block text-gray-500 mb-1">Project Manager (PM):</span>
              <strong className="text-gray-200 text-sm">{reportData.project.projectManagerName}</strong>
            </div>
            <div>
              <span className="block text-gray-500 mb-1">Methodology Frame:</span>
              <strong className="text-gray-200 text-sm">{reportData.project.methodology}</strong>
            </div>
            <div>
              <span className="block text-gray-500 mb-1">Overall Status:</span>
              <strong className="text-gray-200 text-sm capitalize">{reportData.project.status}</strong>
            </div>
          </div>

          {/* Metrics Breakdown cards */}
          <div>
            <h5 className="font-extrabold text-blue-400 uppercase tracking-wider text-xs mb-3">
              Milestone Metrics Summary
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-900 border border-gray-800/80 rounded-xl text-center">
                <span className="block text-[10px] uppercase text-gray-500">Tasks Completed</span>
                <strong className="text-xl text-gray-200 mt-1 block">
                  {reportData.metrics.completedTasks} / {reportData.metrics.totalTasks}
                </strong>
              </div>
              <div className="p-4 bg-gray-900 border border-gray-800/80 rounded-xl text-center">
                <span className="block text-[10px] uppercase text-gray-500">Task Close Rate</span>
                <strong className="text-xl text-blue-400 mt-1 block">
                  {reportData.metrics.completionPercentage}%
                </strong>
              </div>
              <div className="p-4 bg-gray-900 border border-gray-800/80 rounded-xl text-center">
                <span className="block text-[10px] uppercase text-gray-500">Bugs Resolved</span>
                <strong className="text-xl text-gray-200 mt-1 block">
                  {reportData.metrics.resolvedBugs} / {reportData.metrics.totalBugs}
                </strong>
              </div>
              <div className="p-4 bg-gray-900 border border-gray-800/80 rounded-xl text-center">
                <span className="block text-[10px] uppercase text-gray-500">QA Fix Rate</span>
                <strong className="text-xl text-emerald-400 mt-1 block">
                  {reportData.metrics.bugResolutionPercentage}%
                </strong>
              </div>
            </div>
          </div>

          {/* Team performance metrics table */}
          <div>
            <h5 className="font-extrabold text-blue-400 uppercase tracking-wider text-xs mb-3">
              Team Contribution Breakdown
            </h5>
            <div className="overflow-x-auto border border-gray-800 rounded-xl">
              <table className="w-full text-left text-xs text-gray-400">
                <thead className="bg-gray-900/60 text-gray-500 uppercase border-b border-gray-800">
                  <tr>
                    <th className="p-3">Employee Name</th>
                    <th className="p-3">Role</th>
                    <th className="p-3 text-center">Tasks Closed</th>
                    <th className="p-3 text-center">Bugs Resolved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/65">
                  {reportData.teamPerformance.map((emp: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-900/20">
                      <td className="p-3 text-gray-200 font-semibold">{emp.employeeName}</td>
                      <td className="p-3 capitalize">{emp.role}</td>
                      <td className="p-3 text-center text-blue-400 font-semibold font-mono">
                        {emp.tasksCompleted} / {emp.tasksAssigned}
                      </td>
                      <td className="p-3 text-center text-emerald-400 font-semibold font-mono">
                        {emp.bugsResolved} / {emp.bugsAssigned}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Project Closeout Analysis */}
          {reportData.aiSummary && (
            <div className="border-t border-[#1e2e4f]/25 pt-6 mt-6">
              <h5 className="font-extrabold text-indigo-400 uppercase tracking-wider text-xs mb-3 flex items-center gap-1.5">
                ✨ AI Executive Closeout Summary
              </h5>
              <div className="bg-[#0b0f19]/75 border border-indigo-950/45 p-5 rounded-xl text-gray-300 text-xs whitespace-pre-line leading-relaxed font-mono">
                {reportData.aiSummary}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center text-gray-500 italic border border-dashed border-[#1e2e4f]/30 rounded-xl">
          Click the compile button above to perform analysis on tasks, sprints, and bug resolve timelines.
        </div>
      )}
    </div>
  );
};

export default ReportTab;
