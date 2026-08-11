export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "project_manager" | "employee";
  phone?: string;
  department?: string;
  experience?: number;
  skills?: string[];
  profilePicture?: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  techStack: string[];
  methodology: string;
  priority: "low" | "medium" | "high";
  status: "planning" | "active" | "completed";
  projectManager?: User;
  assignedEmployees: User[];
  srsDocument?: any;
  startDate?: string;
  endDate?: string;
}

export interface Sprint {
  _id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: "active" | "completed";
}

export interface Task {
  _id: string;
  name: string;
  description: string;
  techStack: string[];
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "testing" | "done";
  deadline: string;
  assignedEmployee?: User;
  sprint?: { _id: string; name: string };
  statusHistory: any[];
  project?: { _id: string; name: string } | any;
}

export interface Bug {
  _id: string;
  name: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "testing" | "done";
  deadline: string;
  assignedEmployee?: User;
  sprint?: { _id: string; name: string };
  project?: { _id: string; name: string } | any;
  reportedBy?: User;
}

export interface DiscussionMessage {
  _id: string;
  sender: User;
  message: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
}
