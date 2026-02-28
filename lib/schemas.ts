import { z } from "zod";

// ─── Specifications ───
export const SpecificationsSchema = z.record(z.string(), z.union([z.string(), z.number()]));

// ─── Registry Item (Wiki Component) ───
export const RegistryItemSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  name: z.string().min(1, "Name is required").max(120, "Name too long"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).default([]),
  image: z.string().url().optional().or(z.literal("")),
  specifications: SpecificationsSchema,
  description: z.string().max(5000, "Description too long").optional(),
  pinout: z.string().optional(), // markdown or image URL for pinout diagram
  datasheet: z.string().url().optional().or(z.literal("")), // link to datasheet PDF
  mediaUrls: z.array(z.string()).default([]), // gallery images & videos
  relatedSlugs: z.array(z.string()).default([]), // related components
  authorId: z.string().optional(),
  authorName: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("published"),
  viewCount: z.number().default(0),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

// ─── Guide (Hyperlocal Knowledge) ───
export const GuideSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(300).optional(),
  registrySlug: z.string().min(1, "Must be linked to a registry item"),
  hyperlocalTags: z.array(z.string()).default([]),
  mediaUrls: z.array(z.string()).default([]),
  authorId: z.string(),
  authorName: z.string().optional(),
  status: z.enum(["draft", "published"]).default("published"),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

// ─── Project Showcase ───
export const ProjectPartSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().min(1).default(1),
  registrySlug: z.string().optional(), // links to wiki entry
  notes: z.string().optional(),
});

export const ProjectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  content: z.string().optional(), // detailed write-up
  coverImage: z.string().url().optional().or(z.literal("")),
  mediaUrls: z.array(z.string()).default([]),
  parts: z.array(ProjectPartSchema).default([]),
  code: z.string().optional(), // code snippet
  codeLanguage: z.string().default("cpp"), // language for syntax highlighting
  tags: z.array(z.string()).default([]),
  authorId: z.string(),
  authorName: z.string().optional(),
  status: z.enum(["draft", "published", "featured"]).default("published"),
  viewCount: z.number().default(0),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

// ─── Category Definition ───
export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().optional(),
  description: z.string().optional(),
  count: z.number().default(0),
});

// ─── Type Exports ───
export type RegistryItem = z.infer<typeof RegistryItemSchema>;
export type Guide = z.infer<typeof GuideSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type ProjectPart = z.infer<typeof ProjectPartSchema>;
export type Specifications = z.infer<typeof SpecificationsSchema>;
export type Category = z.infer<typeof CategorySchema>;

// ─── Constants ───
export const CATEGORIES: Category[] = [
  { id: "mcu", name: "Microcontrollers", icon: "Cpu", count: 0 },
  { id: "sensor", name: "Sensors", icon: "Radio", count: 0 },
  { id: "power", name: "Power Management", icon: "Zap", count: 0 },
  { id: "communication", name: "Communication", icon: "Wifi", count: 0 },
  { id: "display", name: "Displays", icon: "Monitor", count: 0 },
  { id: "actuator", name: "Actuators & Motors", icon: "Cog", count: 0 },
  { id: "passive", name: "Passive Components", icon: "CircuitBoard", count: 0 },
  { id: "other", name: "Other", icon: "Package", count: 0 },
];

export const FILE_LIMITS = {
  maxImageSize: 5 * 1024 * 1024,   // 5MB
  maxVideoSize: 50 * 1024 * 1024,  // 50MB
  maxFilesPerUpload: 10,
  allowedImageTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  allowedVideoTypes: ["video/mp4", "video/webm"],
};
