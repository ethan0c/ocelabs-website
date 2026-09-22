CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" uuid NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"kind" text NOT NULL,
	"detail" jsonb
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text,
	"company" text,
	"email" text NOT NULL,
	"source" text DEFAULT 'contact form' NOT NULL,
	"message" text,
	"budget" text,
	"stage" text DEFAULT 'new' NOT NULL,
	"next_action" text,
	"next_action_at" timestamp with time zone,
	"notes" text,
	"quote" jsonb,
	"questionnaire_token" text,
	"questionnaire" jsonb,
	"questionnaire_at" timestamp with time zone,
	"call_at" timestamp with time zone,
	"brand_files_at" timestamp with time zone,
	"copy_at" timestamp with time zone,
	"kickoff_at" timestamp with time zone,
	"launch_at" timestamp with time zone,
	"design_approved_at" timestamp with time zone,
	"staging_approved_at" timestamp with time zone,
	"domain" text,
	"handover_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	CONSTRAINT "leads_questionnaire_token_unique" UNIQUE("questionnaire_token")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" uuid NOT NULL,
	"proposal_id" uuid,
	"stage_index" integer NOT NULL,
	"label" text NOT NULL,
	"pct" integer NOT NULL,
	"amount" integer NOT NULL,
	"trigger" text NOT NULL,
	"due_days" integer NOT NULL,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"stripe_invoice_id" text,
	"stripe_url" text,
	"sent_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	CONSTRAINT "payments_stripe_invoice_id_unique" UNIQUE("stripe_invoice_id")
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"token" text NOT NULL,
	"quote" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"viewed_at" timestamp with time zone,
	"status" text DEFAULT 'draft' NOT NULL,
	"signed_at" timestamp with time zone,
	"signer_name" text,
	"signer_email" text,
	"signer_ip" text,
	"signer_ua" text,
	"doc_hash" text,
	CONSTRAINT "proposals_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;