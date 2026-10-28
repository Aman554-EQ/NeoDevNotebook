import { sql, type SQL } from "drizzle-orm"
import {
  customType,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

/**
 * Schema v1. Content tables are a seeded copy of content/ (source of truth is Git)
 * and power full-text search. users/progress/bookmarks are ready for accounts later (unused in v1).
 */

const tsvector = customType<{ data: string }>({ dataType: () => "tsvector" })

export const difficulty = pgEnum("difficulty", ["easy", "simple", "medium", "hard"])

export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  part: integer("part").notNull(),
  sortOrder: integer("sort_order").notNull(),
  description: text("description").notNull(),
})

export const lessons = pgTable(
  "lessons",
  {
    id: serial("id").primaryKey(),
    moduleId: integer("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    sortOrder: integer("sort_order").notNull(),
    estMinutes: integer("est_minutes").notNull(),
    difficulty: difficulty("difficulty").notNull(),
    summary: text("summary").notNull(),
    bodyText: text("body_text").notNull(),
    search: tsvector("search").generatedAlwaysAs(
      (): SQL =>
        sql`setweight(to_tsvector('english', ${lessons.title}), 'A') || setweight(to_tsvector('english', ${lessons.summary}), 'B') || setweight(to_tsvector('english', ${lessons.bodyText}), 'C')`,
    ),
  },
  (t) => [
    uniqueIndex("lessons_module_slug_uq").on(t.moduleId, t.slug),
    index("lessons_search_idx").using("gin", t.search),
  ],
)

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
})

export const problems = pgTable(
  "problems",
  {
    id: text("id").primaryKey(),
    moduleId: integer("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    difficulty: difficulty("difficulty").notNull(),
    statement: text("statement").notNull(),
    solutionCode: text("solution_code").notNull(),
    explanation: text("explanation").notNull(),
    complexity: text("complexity").notNull(),
    search: tsvector("search").generatedAlwaysAs(
      (): SQL =>
        sql`setweight(to_tsvector('english', ${problems.title}), 'A') || setweight(to_tsvector('english', ${problems.statement}), 'B') || setweight(to_tsvector('english', ${problems.explanation}), 'C')`,
    ),
  },
  (t) => [
    uniqueIndex("problems_module_title_uq").on(t.moduleId, t.title),
    index("problems_search_idx").using("gin", t.search),
  ],
)

export const interviewQuestions = pgTable(
  "interview_questions",
  {
    id: text("id").primaryKey(),
    moduleId: integer("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    shortAnswer: text("short_answer").notNull(),
    detailedAnswer: text("detailed_answer").notNull(),
    code: text("code"),
    difficulty: difficulty("difficulty").notNull(),
    search: tsvector("search").generatedAlwaysAs(
      (): SQL =>
        sql`setweight(to_tsvector('english', ${interviewQuestions.question}), 'A') || setweight(to_tsvector('english', ${interviewQuestions.shortAnswer}), 'B') || setweight(to_tsvector('english', ${interviewQuestions.detailedAnswer}), 'C')`,
    ),
  },
  (t) => [index("interview_search_idx").using("gin", t.search)],
)

export const problemTags = pgTable(
  "problem_tags",
  {
    problemId: text("problem_id")
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.problemId, t.tagId] })],
)

export const interviewTags = pgTable(
  "interview_tags",
  {
    questionId: text("question_id")
      .notNull()
      .references(() => interviewQuestions.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.questionId, t.tagId] })],
)

// ---- Ready for accounts (not used in v1: progress lives in the browser) ----

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const progress = pgTable(
  "progress",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    itemType: text("item_type").notNull(),
    itemId: text("item_id").notNull(),
    status: text("status").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.itemType, t.itemId] })],
)

export const bookmarks = pgTable(
  "bookmarks",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    itemType: text("item_type").notNull(),
    itemId: text("item_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.itemType, t.itemId] })],
)

/** Footer newsletter sign-ups (no emails are sent yet; the list is kept for later). */
export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})
