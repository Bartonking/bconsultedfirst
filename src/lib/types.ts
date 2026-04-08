export interface Lead {
  id: string;
  email: string;
  siteUrl: string;
  storeName?: string;
  challengeArea?: string;
  consentStatus: boolean;
  createdAt: string;
}

export interface AuditJob {
  id: string;
  leadId: string;
  status: "pending" | "processing" | "complete" | "failed";
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface AuditReport {
  id: string;
  jobId: string;
  storeUrl: string;
  executiveSummary: string;
  overallScore: number;
  categories: AuditCategory[];
  findings: AuditFinding[];
  recommendations: string[];
  createdAt: string;
}

export interface AuditCategory {
  name: string;
  score: number;
  maxScore: number;
  summary: string;
}

export interface AuditFinding {
  category: string;
  observation: string;
  whyItMatters: string;
  recommendation: string;
  severity: "low" | "medium" | "high";
}

export interface Consultation {
  id: string;
  leadId: string;
  consultationStatus: "requested" | "scheduled" | "completed" | "cancelled";
  bookedAt?: string;
  notes?: string;
}
