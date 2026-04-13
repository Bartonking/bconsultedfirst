import { z } from "zod";

const auditEngagementStatusSchema = z.enum([
  "proposed",
  "intake_pending",
  "intake_received",
  "meeting_scheduled",
  "meeting_completed",
  "in_progress",
  "draft_ready",
  "delivered",
  "closed",
  "cancelled",
]);

const serviceIntakeStepSchema = z.enum([
  "teamSize",
  "fulfillmentSetup",
  "systems",
  "bottlenecks",
  "goals",
]);

const serviceIntakeOptionSchema = z.object({
  id: z.string().min(1, "Option ID is required"),
  label: z.string().min(1, "Option label is required"),
  description: z.string().min(1, "Option description is required"),
  iconKey: z.string().min(1, "Icon key is required"),
  active: z.boolean(),
  source: z.enum(["system", "admin"]).optional(),
  promptLabel: z.string().optional(),
  placeholder: z.string().optional(),
});

const serviceIntakeQuestionConfigSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().min(1, "Subtitle is required"),
  type: z.enum(["single", "multi", "goal_cards"]),
  allowCustom: z.boolean().optional(),
  allowDetail: z.boolean().optional(),
  detailLabel: z.string().optional(),
  detailPlaceholder: z.string().optional(),
  customInputLabel: z.string().optional(),
  customInputPlaceholder: z.string().optional(),
  options: z.array(serviceIntakeOptionSchema),
});

const serviceIntakeQuestionsSchema = z.object({
  teamSize: serviceIntakeQuestionConfigSchema,
  fulfillmentSetup: serviceIntakeQuestionConfigSchema,
  systems: serviceIntakeQuestionConfigSchema,
  bottlenecks: serviceIntakeQuestionConfigSchema,
  goals: serviceIntakeQuestionConfigSchema,
});

export const auditEngagementIntakeSchema = z.object({
  teamSize: z.string().optional(),
  fulfillmentSetup: z.string().optional(),
  systems: z.string().optional(),
  topProblems: z.array(z.string()).optional(),
  goals: z.string().optional(),
});

export const createAuditSchema = z.object({
  email: z.string().email("Invalid email address"),
  storeUrl: z
    .string()
    .min(1, "Store URL is required")
    .transform((url) => {
      // Normalize: strip protocol if present, ensure it looks like a domain
      const clean = url.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
      return clean;
    }),
  challenge: z.string().optional(),
});

export const createConsultationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  storeUrl: z.string().min(1, "Store URL is required"),
  teamSize: z.string().optional(),
  challenge: z.string().optional(),
  context: z.string().optional(),
});

export const createContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

export const subscribeSchema = z
  .object({
    token: z.string().optional(),
    email: z.string().email("Invalid email address").optional(),
    name: z.string().optional(),
    storeUrl: z.string().optional(),
  })
  .refine((data) => data.token || data.email, {
    message: "Token or email is required",
    path: ["token"],
  });

export const checkoutSessionSchema = z.object({
  token: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  storeUrl: z.string().optional(),
  teamSize: z.string().optional(),
  challenge: z.string().optional(),
  context: z.string().optional(),
});

export const createAuditEngagementSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  consultationId: z.string().optional(),
  reportId: z.string().optional(),
});

export const updateAuditEngagementSchema = z.object({
  status: auditEngagementStatusSchema.optional(),
  owner: z.string().optional(),
  meetingAt: z.string().optional(),
  meetingUrl: z.string().optional(),
  meetingNotes: z.string().optional(),
  intakeResponses: auditEngagementIntakeSchema.optional(),
  internalNotes: z.string().optional(),
  prioritySummary: z.string().optional(),
  finalReportFormat: z.enum(["html", "pdf"]).optional(),
  finalReportHtml: z.string().optional(),
  finalReportUrl: z.string().optional(),
});

export const submitServiceIntakeSchema = z.object({
  token: z.string().min(1, "Token is required"),
  teamSize: z.string().min(1, "Team size is required"),
  fulfillmentSetup: z.string().min(1, "Fulfillment setup is required"),
  systems: z.string().min(1, "Systems summary is required"),
  topProblems: z
    .array(z.string().min(1, "Each problem must have text"))
    .min(1, "Add at least one operational problem"),
  goals: z.string().min(1, "Goals are required"),
});

export const saveServiceIntakeDraftSchema = z.object({
  token: z.string().min(1, "Token is required"),
  teamSize: z.string().optional(),
  fulfillmentSetup: z.string().optional(),
  systems: z.string().optional(),
  topProblems: z.array(z.string().min(1)).optional(),
  goals: z.string().optional(),
});

export const updateServiceIntakeConfigSchema = z.object({
  version: z.number().int().positive().optional(),
  questions: serviceIntakeQuestionsSchema,
});

export { serviceIntakeQuestionConfigSchema, serviceIntakeOptionSchema, serviceIntakeStepSchema };
