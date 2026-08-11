import { ISRSDocument } from "../models/Project";

/**
 * AI Service Generative Engine Stub
 * Ready for API or LangChain integration.
 */
export const generateSRS = async (
  projectName: string,
  description: string,
  techStack: string[],
  methodology: string
): Promise<ISRSDocument> => {
  // TODO: Implement actual AI / LangChain integration here later
  return {
    introduction: {
      purpose: `AI Generation for ${projectName} is ready to be implemented.`,
      scope: "",
      objectives: [],
    },
    overallDescription: "",
    functionalRequirements: {
      adminModule: [],
      pmModule: [],
      employeeModule: [],
    },
    nonFunctionalRequirements: {
      performance: "",
      security: "",
      reliability: "",
      scalability: "",
    },
    generatedAt: new Date(),
  };
};

export const generateTaskDescription = async (
  taskName: string,
  projectTechStack: string[]
): Promise<string> => {
  // TODO: Implement actual AI / LangChain integration here later
  return `Objective: ${taskName}`;
};
