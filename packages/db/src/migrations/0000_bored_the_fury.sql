CREATE TYPE "public"."assessment_status" AS ENUM('draft', 'in_progress', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."entity_type" AS ENUM('organization', 'user', 'system', 'assessment', 'report', 'scan');--> statement-breakpoint
CREATE TYPE "public"."jurisdiction" AS ENUM('na', 'eu', 'in', 'ae');--> statement-breakpoint
CREATE TYPE "public"."plan" AS ENUM('free', 'starter', 'growth', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."risk_level" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"jurisdiction" "jurisdiction" NOT NULL,
	"plan" "plan" DEFAULT 'free' NOT NULL,
	"stripe_subscription_id" text,
	"pqc_public_key" text,
	"pqc_secret_key_encrypted" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"pqc_hash" text,
	"pqc_signature" text,
	"hedera_tx_id" text,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"email" text NOT NULL,
	"organization_id" uuid,
	"jurisdiction" "jurisdiction",
	"plan" "plan",
	"stripe_customer_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"pqc_hash" text,
	"pqc_signature" text,
	"hedera_tx_id" text,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
CREATE TABLE "systems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"risk_level" text,
	"jurisdiction" "jurisdiction" NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"pqc_hash" text,
	"pqc_signature" text,
	"hedera_tx_id" text
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"system_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"jurisdiction" "jurisdiction" NOT NULL,
	"framework" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"responses" jsonb,
	"qrs_score" integer,
	"current_section" integer DEFAULT 0,
	"risk_level" text,
	"recommendations" jsonb,
	"key_findings" jsonb,
	"category_scores" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"pqc_hash" text,
	"pqc_signature" text,
	"hedera_tx_id" text
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"content_markdown" text,
	"ai_model" text,
	"ai_cost_cents" integer,
	"mode" text DEFAULT 'template',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"pqc_hash" text,
	"pqc_signature" text,
	"hedera_tx_id" text
);
--> statement-breakpoint
CREATE TABLE "scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain" text NOT NULL,
	"organization_id" uuid,
	"qrs_score" integer,
	"algorithms" jsonb,
	"certificates" jsonb,
	"recommendations" jsonb,
	"jurisdiction" "jurisdiction",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"pqc_hash" text,
	"pqc_signature" text,
	"hedera_tx_id" text
);
--> statement-breakpoint
CREATE TABLE "audit_trail" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"action" text NOT NULL,
	"user_id" text,
	"hedera_topic_id" text,
	"hedera_tx_id" text,
	"hedera_sequence" bigint,
	"hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"pqc_signature" text
);
--> statement-breakpoint
CREATE TABLE "pqc_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"public_key" text NOT NULL,
	"encrypted_secret_key" text NOT NULL,
	"algorithm" text DEFAULT 'ML-DSA-65' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"rotated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email_hash" text NOT NULL,
	"jurisdiction" "jurisdiction",
	"source" text,
	"subscribed_at" timestamp DEFAULT now() NOT NULL,
	"consent_text_hash" text,
	"consent_pqc_signature" text,
	"consent_hedera_tx_id" text,
	CONSTRAINT "newsletter_email_hash_unique" UNIQUE("email_hash")
);
--> statement-breakpoint
CREATE TABLE "billing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"stripe_event_id" text,
	"type" text NOT NULL,
	"amount_cents" integer,
	"currency" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"pqc_hash" text,
	"pqc_signature" text,
	"hedera_tx_id" text,
	CONSTRAINT "billing_stripe_event_id_unique" UNIQUE("stripe_event_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "systems" ADD CONSTRAINT "systems_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_system_id_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scans" ADD CONSTRAINT "scans_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pqc_keys" ADD CONSTRAINT "pqc_keys_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing" ADD CONSTRAINT "billing_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;