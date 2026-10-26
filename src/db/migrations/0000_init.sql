CREATE TYPE "public"."difficulty" AS ENUM('easy', 'simple', 'medium', 'hard');--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"user_id" uuid NOT NULL,
	"item_type" text NOT NULL,
	"item_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookmarks_user_id_item_type_item_id_pk" PRIMARY KEY("user_id","item_type","item_id")
);
--> statement-breakpoint
CREATE TABLE "interview_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"module_id" integer NOT NULL,
	"question" text NOT NULL,
	"short_answer" text NOT NULL,
	"detailed_answer" text NOT NULL,
	"code" text,
	"difficulty" "difficulty" NOT NULL,
	"search" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('english', "interview_questions"."question"), 'A') || setweight(to_tsvector('english', "interview_questions"."short_answer"), 'B') || setweight(to_tsvector('english', "interview_questions"."detailed_answer"), 'C')) STORED
);
--> statement-breakpoint
CREATE TABLE "interview_tags" (
	"question_id" text NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "interview_tags_question_id_tag_id_pk" PRIMARY KEY("question_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"module_id" integer NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"sort_order" integer NOT NULL,
	"est_minutes" integer NOT NULL,
	"difficulty" "difficulty" NOT NULL,
	"summary" text NOT NULL,
	"body_text" text NOT NULL,
	"search" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('english', "lessons"."title"), 'A') || setweight(to_tsvector('english', "lessons"."summary"), 'B') || setweight(to_tsvector('english', "lessons"."body_text"), 'C')) STORED
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"part" integer NOT NULL,
	"sort_order" integer NOT NULL,
	"description" text NOT NULL,
	CONSTRAINT "modules_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "problem_tags" (
	"problem_id" text NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "problem_tags_problem_id_tag_id_pk" PRIMARY KEY("problem_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "problems" (
	"id" text PRIMARY KEY NOT NULL,
	"module_id" integer NOT NULL,
	"title" text NOT NULL,
	"difficulty" "difficulty" NOT NULL,
	"statement" text NOT NULL,
	"solution_code" text NOT NULL,
	"explanation" text NOT NULL,
	"complexity" text NOT NULL,
	"search" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('english', "problems"."title"), 'A') || setweight(to_tsvector('english', "problems"."statement"), 'B') || setweight(to_tsvector('english', "problems"."explanation"), 'C')) STORED
);
--> statement-breakpoint
CREATE TABLE "progress" (
	"user_id" uuid NOT NULL,
	"item_type" text NOT NULL,
	"item_id" text NOT NULL,
	"status" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "progress_user_id_item_type_item_id_pk" PRIMARY KEY("user_id","item_type","item_id")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_questions" ADD CONSTRAINT "interview_questions_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_tags" ADD CONSTRAINT "interview_tags_question_id_interview_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."interview_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_tags" ADD CONSTRAINT "interview_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_tags" ADD CONSTRAINT "problem_tags_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_tags" ADD CONSTRAINT "problem_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problems" ADD CONSTRAINT "problems_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "interview_search_idx" ON "interview_questions" USING gin ("search");--> statement-breakpoint
CREATE UNIQUE INDEX "lessons_module_slug_uq" ON "lessons" USING btree ("module_id","slug");--> statement-breakpoint
CREATE INDEX "lessons_search_idx" ON "lessons" USING gin ("search");--> statement-breakpoint
CREATE UNIQUE INDEX "problems_module_title_uq" ON "problems" USING btree ("module_id","title");--> statement-breakpoint
CREATE INDEX "problems_search_idx" ON "problems" USING gin ("search");