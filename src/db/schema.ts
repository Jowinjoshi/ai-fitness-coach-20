import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Users table with gamification features
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  xp: integer('xp').notNull().default(0),
  level: integer('level').notNull().default(1),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastLoginDate: text('last_login_date'), // ISO date string
  isGuest: integer('is_guest', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Fitness plans table
export const fitnessPlans = sqliteTable('fitness_plans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  planType: text('plan_type').notNull(), // 'workout', 'diet', or 'combined'
  fitnessGoal: text('fitness_goal'),
  fitnessLevel: text('fitness_level'),
  age: integer('age'),
  weight: real('weight'),
  height: real('height'),
  dietaryPreferences: text('dietary_preferences'),
  workoutContent: text('workout_content', { mode: 'json' }),
  dietContent: text('diet_content', { mode: 'json' }),
  motivationContent: text('motivation_content', { mode: 'json' }),
  createdAt: text('created_at').notNull(),
});

// Daily logins table for streak tracking
export const dailyLogins = sqliteTable('daily_logins', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  loginDate: text('login_date').notNull(), // ISO date string
  xpEarned: integer('xp_earned').notNull().default(10),
  createdAt: text('created_at').notNull(),
});

// Quiz attempts table
export const quizAttempts = sqliteTable('quiz_attempts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  score: integer('score').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  xpEarned: integer('xp_earned').notNull(),
  quizData: text('quiz_data', { mode: 'json' }),
  createdAt: text('created_at').notNull(),
});

// User achievements table
export const userAchievements = sqliteTable('user_achievements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  achievementType: text('achievement_type').notNull(),
  achievementName: text('achievement_name').notNull(),
  description: text('description'),
  xpReward: integer('xp_reward').notNull(),
  earnedAt: text('earned_at').notNull(),
});