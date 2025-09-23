import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-zA-Z0-9_]+$/);

export const registerSchema = z.object({
  email: z.string().email(),
  username: usernameSchema,
  password: z.string().min(8).max(100),
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
});

export const loginSchema = z.object({
  identifier: z.string().min(1), // email or username
  password: z.string().min(8),
});

export const profileUpdateSchema = z.object({
  bio: z.string().max(160).optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  visibility: z.enum(["public", "private", "followers_only"]).optional(),
});

export const createPostSchema = z.object({
  content: z.string().min(1).max(280),
  image_url: z.string().url().optional().nullable(),
  category: z.enum(["general", "announcement", "question"]).default("general"),
});

export const commentSchema = z.object({
  content: z.string().min(1).max(200),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(50).default(20),
});
