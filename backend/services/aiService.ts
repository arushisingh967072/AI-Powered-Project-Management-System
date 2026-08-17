import { GoogleGenerativeAI } from "@google/generative-ai";
import { ISRSDocument } from "../models/Project";

// Initialize Gemini client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * AI SRS Document Generator using Gemini API
 */
export const generateSRS = async (
  projectName: string,
  description: string,
  techStack: string[],
  methodology: string
): Promise<ISRSDocument> => {
  if (!genAI) {
    console.warn("⚠️ GEMINI_API_KEY is not defined. Falling back to simulated SRS data.");
    return {
      introduction: {
        purpose: `This is a fallback summary for ${projectName} because GEMINI_API_KEY was not configured.`,
        scope: `Development scope using ${techStack.join(", ")} methodology ${methodology}.`,
        objectives: ["Establish foundational project architecture.", "Deliver minimal viable feature-set."],
      },
      overallDescription: `A software closeout project utilizing ${techStack.join(", ")} and structured methodology.`,
      functionalRequirements: {
        adminModule: ["User and privilege administration.", "Audit trail logging."],
        pmModule: ["Milestone configuration.", "Resource utilization metrics."],
        employeeModule: ["Workflow state transition update.", "Ticket commentary inputs."],
      },
      nonFunctionalRequirements: {
        performance: "Sub-second database query responsiveness.",
        security: "JWT cookie-based HTTP-Only authorization.",
        reliability: "99.9% application service availability.",
        scalability: "Horizontal container instances clustering support.",
      },
      generatedAt: new Date(),
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Generate a professional Software Requirements Specification (SRS) in JSON format for a software project:
- Project Name: "${projectName}"
- Project Description: "${description}"
- Technologies: ${techStack.join(", ")}
- Methodology: ${methodology}

The JSON response must match this schema exactly:
{
  "introduction": {
    "purpose": "string",
    "scope": "string",
    "objectives": ["string"]
  },
  "overallDescription": "string",
  "functionalRequirements": {
    "adminModule": ["string"],
    "pmModule": ["string"],
    "employeeModule": ["string"]
  },
  "nonFunctionalRequirements": {
    "performance": "string",
    "security": "string",
    "reliability": "string",
    "scalability": "string"
  }
}
Return only the raw JSON text. No markdown wrap.`;

    const result = await model.generateContent(prompt);
    const jsonText = result.response.text().replace(/```json|```/g, "").trim();
    const srsDoc = JSON.parse(jsonText);
    return {
      ...srsDoc,
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error("❌ Gemini SRS generation failed, using mock data:", error);
    throw error;
  }
};

/**
 * AI Task or Bug Description Generator using Gemini API
 */
export const generateTaskDescription = async (
  taskName: string,
  projectTechStack: string[]
): Promise<string> => {
  const techString = projectTechStack.length > 0 ? projectTechStack.join(", ") : "relevant technologies";

  if (!genAI) {
    console.warn("⚠️ GEMINI_API_KEY is not defined. Falling back to simulated task data.");
    return `### Objective
Implement and verify the functionality for: "${taskName}".

### Key Requirements
1. Design a clean, modular component/function workflow.
2. Integrate securely using ${techString}.
3. Implement comprehensive error handling and logging.
4. Validate inputs to prevent unexpected runtime errors.

### Verification Plan
- Write unit/integration tests covering standard and edge cases.
- Perform visual or functional verification locally.`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Write a detailed technical summary and checklist description for a development task or bug ticket:
Title/Issue: "${taskName}"
Technology Stack: ${techString}

Write the response in structured markdown with the following layout:
### Objective
[Clear explanation of the feature implementation or defect remediation goal]

### Key Requirements
- [Technical requirement item 1]
- [Technical requirement item 2]
- [Technical requirement item 3]

### Verification & Testing
- [Step-by-step description of verification flow or unit/integration tests to run]`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("❌ Gemini Task Description generation failed:", error);
    throw error;
  }
};

/**
 * AI Project Closeout Report Summary Generator using Gemini API
 */
export const generateProjectReportSummary = async (
  project: any,
  metrics: any,
  sprints: any[],
  teamPerformance: any[]
): Promise<string> => {
  if (!genAI) {
    console.warn("⚠️ GEMINI_API_KEY is not defined. Falling back to simulated report summary.");
    return `### Executive Closing Assessment
The project "${project.name}" has successfully concluded its primary milestones under the ${project.methodology} framework. A total of ${metrics.completedTasks} out of ${metrics.totalTasks} tasks (${metrics.completionPercentage}%) have been resolved and closeout checks have been satisfied.

### Team Success & Strengths
- Highly efficient task execution across sprints.
- Outstanding bugs resolution rate standing at ${metrics.bugResolutionPercentage}% closeout metrics.
- Active sprint goal validation across all team developers.

### Bottlenecks & Recommendations
- Ensure thorough automated regression coverage in future iterations to maintain QA fix rates.
- Transition manual workflow validation checks into automated continuous delivery logs.`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a Senior Closeout Project Management Consultant. Analyze the following project closing metrics and deliver a professional executive closeout summary in Markdown:
Project Details:
- Name: ${project.name}
- Description: ${project.description}
- Methodology: ${project.methodology}
- Status: ${project.status}

Milestone Metrics:
- Total Tasks: ${metrics.totalTasks}
- Completed Tasks: ${metrics.completedTasks}
- Completion Rate: ${metrics.completionPercentage}%
- QA Bugs Reported: ${metrics.totalBugs}
- QA Bugs Resolved: ${metrics.resolvedBugs}
- QA Fix Rate: ${metrics.bugResolutionPercentage}%

Sprint Closeout Status:
${sprints.map((s: any) => `- Sprint ${s.name}: Goal: "${s.goal}", Status: ${s.status}`).join("\n")}

Team Contributions:
${teamPerformance.map((t: any) => `- ${t.employeeName} (${t.role}): Completed ${t.tasksCompleted}/${t.tasksAssigned} tasks, Resolved ${t.bugsResolved}/${t.bugsAssigned} bugs`).join("\n")}

Format the response into structured Markdown sections containing:
### Executive Closing Assessment
[Strategic high-level summary of the project state and success rate]

### Team Successes & Strengths
- [Success metric 1]
- [Success metric 2]

### Bottlenecks & Recommendations
- [Analysis of any delays or bottleneck areas based on tasks/bugs rates]
- [Specific recommendations for future release phases]`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("❌ Gemini Report Summary generation failed:", error);
    throw error;
  }
};
