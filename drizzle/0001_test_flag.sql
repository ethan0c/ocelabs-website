ALTER TABLE "leads" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "test" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "proposal_edits" jsonb;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "retainer_monthly" integer;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "retainer_sub_id" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "retainer_start_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "retainer_status" text;--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "priced" jsonb;--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "edits" jsonb;