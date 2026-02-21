import { z } from "zod";

export const SpecificationsSchema = z.record(z.string(), z.union([z.string(), z.number()]));

export const RegistryItemSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1, "Slug is required"),
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).default([]),
  image: z.string().url().optional(),
  specifications: SpecificationsSchema,
  description: z.string().optional(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export const GuideSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  hyperlocalTags: z.array(z.string()).default([]), // e.g. "Region: SE Asia", "Supplier: DigiKey"
  mediaUrls: z.array(z.string().url()).default([]),
  authorId: z.string(),
  createdAt: z.any().optional(),
});

export type RegistryItem = z.infer<typeof RegistryItemSchema>;
export type Guide = z.infer<typeof GuideSchema>;
export type Specifications = z.infer<typeof SpecificationsSchema>;
