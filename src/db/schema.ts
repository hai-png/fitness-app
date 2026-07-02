/**
 * D-09: Database schema (Drizzle ORM + Postgres).
 *
 * SCAFFOLD for the future database-backed sync layer. The app currently
 * uses localStorage exclusively — there is no database. This file defines
 * the schema that will be used when the database is added.
 */
import {
  pgTable,
  text,
  integer,
  real,
  timestamp,
  jsonb,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender"),
  weightKg: real("weight_kg").notNull(),
  heightCm: real("height_cm").notNull(),
  goal: text("goal").notNull(),
  activityLevel: text("activity_level").notNull(),
  workoutPreference: text("workout_preference").notNull(),
  frequency: integer("frequency").notNull(),
  dietType: text("diet_type").notNull(),
  allergies: text("allergies").notNull().default(""),
  selectedGymName: text("selected_gym_name"),
  availableMachines: jsonb("available_machines").$type<string[]>(),
  sex: text("sex"),
  bodyFatPct: real("body_fat_pct"),
  bodyFatMethod: text("body_fat_method"),
  waistCm: real("waist_cm"),
  hipCm: real("hip_cm"),
  neckCm: real("neck_cm"),
  trainingStatus: text("training_status"),
  allTimeHighWeightKg: real("all_time_high_weight_kg"),
  isCurrentlyInDeficit: boolean("is_currently_in_deficit"),
  isWeightReduced: boolean("is_weight_reduced"),
  cachedAssessmentResult: jsonb("cached_assessment_result"),
  cachedNutritionPlan: jsonb("cached_nutrition_plan"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workoutPlans = pgTable("workout_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  plan: jsonb("plan").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const weightLogs = pgTable("weight_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  weightKg: real("weight_kg").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const waterLogs = pgTable("water_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  amountMl: integer("amount_ml").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workoutLogs = pgTable("workout_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  workoutTitle: text("workout_title").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  caloriesBurned: integer("calories_burned").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exerciseLogs = pgTable("exercise_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  exerciseName: text("exercise_name").notNull(),
  targetMuscle: text("target_muscle").notNull(),
  date: text("date").notNull(),
  sets: jsonb("sets").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const intakeLogs = pgTable("intake_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  kcal: integer("kcal").notNull(),
  proteinG: real("protein_g").notNull(),
  carbsG: real("carbs_g").notNull(),
  fatG: real("fat_g").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  items: jsonb("items").notNull(),
  total: real("total").notNull(),
  status: text("status").notNull().default("pending"),
  deliveryAddress: text("delivery_address").notNull(),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const schema = {
  users,
  workoutPlans,
  weightLogs,
  waterLogs,
  workoutLogs,
  exerciseLogs,
  intakeLogs,
  orders,
};
