import { z } from "zod";

export const urlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .max(2048, "URL too long")
  .url("Must be a valid URL")
  .refine(
    (val) => /^https?:\/\//i.test(val),
    "URL must use http or https protocol"
  );

export const codeSchema = z
  .string()
  .trim()
  .min(3, "Code must be at least 3 characters")
  .max(32, "Code must be at most 32 characters")
  .regex(/^[A-Za-z0-9_-]+$/, "Only alphanumeric, dash and underscore allowed");

export const geoRuleSchema = z.object({
  country: z.string().length(2).toUpperCase(),
  url: urlSchema,
});

export const deviceRuleSchema = z.object({
  device: z.enum(["mobile", "tablet", "desktop"]),
  url: urlSchema,
});

export const abVariantSchema = z.object({
  url: urlSchema,
  weight: z.number().int().min(1).max(100),
});

export const linkRulesSchema = z
  .object({
    geo: z.array(geoRuleSchema).optional(),
    device: z.array(deviceRuleSchema).optional(),
    ab: z.array(abVariantSchema).optional(),
    password: z.string().min(4).max(128).optional(),
  })
  .optional();

const dateOrDateTime = z.union([
  z.string().datetime(),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
]);

export const createLinkSchema = z.object({
  targetUrl: urlSchema,
  customCode: codeSchema.optional(),
  expiresAt: dateOrDateTime.optional().nullable(),
  title: z.string().max(120).optional(),
  description: z.string().max(500).optional(),
  rules: linkRulesSchema,
});

export const updateLinkSchema = z.object({
  targetUrl: urlSchema.optional(),
  expiresAt: dateOrDateTime.optional().nullable(),
  enabled: z.boolean().optional(),
  title: z.string().max(120).optional(),
  description: z.string().max(500).optional(),
  rules: linkRulesSchema,
});

export const registerSchema = z.object({
  email: z.string().email().toLowerCase(),
  name: z.string().min(2).max(80),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
