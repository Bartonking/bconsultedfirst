import { z } from "zod";

export const createAuditSchema = z.object({
  email: z.string().email("Invalid email address"),
  storeUrl: z
    .string()
    .min(1, "Store URL is required")
    .transform((url) => {
      // Normalize: strip protocol if present, ensure it looks like a domain
      let clean = url.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
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
