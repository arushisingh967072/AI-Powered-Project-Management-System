import { ISRSDocument } from "../models/Project";

/**
 * AI Service Mock Generative Engine
 * Simulates high-quality, professional LLM completions for project planning, SRS, and task details.
 */
export const generateSRS = async (
  projectName: string,
  description: string,
  techStack: string[],
  methodology: string
): Promise<ISRSDocument> => {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const techStackString = techStack.length > 0 ? techStack.join(", ") : "Modern Web Stack";

  const purpose = `The main purpose of the ${projectName} application is to establish a secure, reliable, and highly collaborative platform for software lifecycle management. By integrating a role-based structure, the system streamlines development workflows from initial project planning to deployment, reducing manual management overhead and boosting operational transparency.`;

  const scope = `The scope of the ${projectName} project encompasses a complete web-based project management utility optimized for remote and cross-functional teams. Built on a robust tech stack (${techStackString}) and executing via the ${methodology} methodology, it delivers secure role-based dashboards, automated reporting metrics, Agile sprint cycle planning, comprehensive bug tracking, and interactive team discussion boards.`;

  const objectives = [
    `Establish a unified database and system registry for all software development projects and resources utilizing ${techStackString}.`,
    `Optimize sprint velocity and project planning using ${methodology} iteration structures.`,
    `Reduce communication latency between Project Managers and Developers through targeted, task-embedded discussion boards.`,
    `Provide real-time analytics dashboards for administrators to track resource availability and team metrics.`,
    `Automate post-project analysis by generating downloadable final reports summarizing task completion and bug rates.`
  ];

  const overallDescription = `The ${projectName} system provides an end-to-end framework for collaborative software development. Utilizing a Role-Based Access Control (RBAC) architecture, the software defines structured execution channels for Administrators (who govern accounts and project setups), Project Managers (who plan milestones, sprints, tasks, and document requirements), and Developers/Employees (who execute tasks, resolve defects, and upload deliverables). The system operates on a single-page reactive architecture to ensure real-time visual updates on state changes and dashboard telemetry.`;

  const adminModule = [
    "User Account Provisioning: Add, update, view, and soft-delete user records containing department, skills, and experience details.",
    `Project Registry: Initialize software projects by defining name, priority, methodology (${methodology}), and assigning a designated Project Manager.`,
    "Resource Allocations: Monitor organizational statistics, employee availability, and system-wide project distributions in a high-level analytics dashboard.",
    "Report Exportation: Access historical project telemetry, filtered by team, manager, and date range, with CSV/Excel export options."
  ];

  const pmModule = [
    "AI-Assisted Requirements Engineering: Enter metadata to dynamically generate detailed Software Requirements Specifications (SRS) for the project.",
    "Agile Sprint Milestones: Define sprints with specific business goals, target timelines, and assign team members to the milestone.",
    "Interactive Kanban Assignment: Create project tasks and assign them to developers, specifying tech stack details, priority (low, medium, high), and deadline.",
    "QA/Bug Tracking: Log reported application bugs with associated severity (low, medium, high, critical), priority, and designated developer assignments.",
    "Real-time Dashboard Metrics: Monitor overall project progress percentage, task status distributions (To Do, In Progress, Testing, Done), and sprint burndowns."
  ];

  const employeeModule = [
    "Personalized Worklist: View a filtered dashboard containing only the tasks and bugs assigned specifically to the logged-in employee.",
    "Status Workflow Management: Transition task statuses in a standard progression (To Do -> In Progress -> Internal Testing -> Done).",
    "QA Resolution Logging: Resolve assigned bugs, update progress logs, and submit resolutions for PM review and verification.",
    "Contextual Discussion Panels: Post text and attach file links inside tasks and bugs to communicate updates directly with project managers."
  ];

  const performance = `The system shall maintain a dashboard telemetry update delay of less than 200ms. High-frequency queries (such as project lists and discussions) must resolve within 150ms. The application should support up to 100 concurrent active users without degradation in response times.`;

  const security = `User passwords must be stored using bcrypt hashes with a work factor of 10. API routes must be protected using JWT tokens in HTTPOnly cookies or Authorization headers. Database writes must execute role-based validation to prevent privilege escalation attacks.`;

  const reliability = `The system must maintain 99.9% uptime. Database transactions must follow ACID principles, ensuring that task status transitions and audit logs are consistently written even during high load periods.`;

  const scalability = `The system architecture should follow standard MVC patterns on the backend, allowing routes and controllers to scale horizontally. The React frontend should load modules dynamically using bundle splitting, optimizing initial load times as the dashboard footprint grows.`;

  return {
    introduction: {
      purpose,
      scope,
      objectives,
    },
    overallDescription,
    functionalRequirements: {
      adminModule,
      pmModule,
      employeeModule,
    },
    nonFunctionalRequirements: {
      performance,
      security,
      reliability,
      scalability,
    },
    generatedAt: new Date(),
  };
};

export const generateTaskDescription = async (
  taskName: string,
  projectTechStack: string[]
): Promise<string> => {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  const techStackStr = projectTechStack.length > 0 ? projectTechStack.join(", ") : "the project framework";

  return `### Development Objective:
Implement and verify "${taskName}" utilizing the defined project technologies: ${techStackStr}.

### Requirements and Subtasks:
1. **Initial Setup**: Establish the necessary files, modules, and tests for this task component.
2. **Implementation**:
   - Write clear, modular code matching the architectural patterns of the codebase.
   - Implement rigorous input validations and error handling wrappers.
   - Interface with relevant state handlers or database modules as required.
3. **Quality Standards**:
   - Verify that code compiles cleanly without TypeScript warnings or lint errors.
   - Ensure the component responds dynamically to viewport variations.
4. **Deliverables**:
   - Complete implementation code files.
   - Inline code comments explaining critical algorithms or configurations.
   - Transition this task to 'Internal Testing' and notify the Project Manager for verification.`;
};
