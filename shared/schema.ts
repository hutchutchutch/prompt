import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const promptTests = pgTable("prompt_tests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  promptText: text("prompt_text").notNull(),
  desiredOutcome: text("desired_outcome").notNull(),
  status: text("status").notNull().default("pending"),
  redTeamEnabled: boolean("red_team_enabled").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const promptResults = pgTable("prompt_results", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").references(() => promptTests.id),
  modelId: text("model_id").notNull(),
  variantId: text("variant_id").notNull(),
  output: text("output").notNull(),
  qualityScore: integer("quality_score"),
  latencyMs: integer("latency_ms"),
  costUsd: integer("cost_usd"),
  vulnerabilityStatus: text("vulnerability_status").notNull().default("unknown"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const savedPrompts = pgTable("saved_prompts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  testId: integer("test_id").references(() => promptTests.id),
  name: text("name").notNull(),
  category: text("category"),
  nextScheduled: timestamp("next_scheduled"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const frameworks = pgTable("frameworks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  enabled: boolean("enabled").notNull().default(true),
});

export const redTeamAttacks = pgTable("red_team_attacks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  numAttacks: integer("num_attacks").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const models = pgTable("models", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  provider: text("provider").notNull(),
  inputCost: integer("input_cost").notNull(),
  outputCost: integer("output_cost").notNull(),
  enabled: boolean("enabled").notNull().default(true),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertPromptTestSchema = createInsertSchema(promptTests).pick({
  userId: true,
  promptText: true,
  desiredOutcome: true,
  redTeamEnabled: true,
});

export const insertPromptResultSchema = createInsertSchema(promptResults).pick({
  testId: true,
  modelId: true,
  variantId: true,
  output: true,
  qualityScore: true,
  latencyMs: true,
  costUsd: true,
  vulnerabilityStatus: true,
  metadata: true,
});

export const insertSavedPromptSchema = createInsertSchema(savedPrompts).pick({
  userId: true,
  testId: true,
  name: true,
  category: true,
  nextScheduled: true,
});

export const insertFrameworkSchema = createInsertSchema(frameworks).pick({
  name: true,
  description: true,
  enabled: true,
});

export const insertRedTeamAttackSchema = createInsertSchema(redTeamAttacks).pick({
  name: true,
  description: true,
  numAttacks: true,
  enabled: true,
});

export const insertModelSchema = createInsertSchema(models).pick({
  name: true,
  provider: true,
  inputCost: true,
  outputCost: true,
  enabled: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type PromptTest = typeof promptTests.$inferSelect;
export type InsertPromptTest = z.infer<typeof insertPromptTestSchema>;

export type PromptResult = typeof promptResults.$inferSelect;
export type InsertPromptResult = z.infer<typeof insertPromptResultSchema>;

export type SavedPrompt = typeof savedPrompts.$inferSelect;
export type InsertSavedPrompt = z.infer<typeof insertSavedPromptSchema>;

export type Framework = typeof frameworks.$inferSelect;
export type InsertFramework = z.infer<typeof insertFrameworkSchema>;

export type RedTeamAttack = typeof redTeamAttacks.$inferSelect;
export type InsertRedTeamAttack = z.infer<typeof insertRedTeamAttackSchema>;

export type Model = typeof models.$inferSelect;
export type InsertModel = z.infer<typeof insertModelSchema>;
