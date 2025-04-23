CREATE TABLE "agents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"license_number" text,
	"license_expiration" date NOT NULL,
	"npn" text,
	"phone_number" text NOT NULL,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"carrier_appointments" text,
	"upline_agent_id" integer,
	"commission_percentage" numeric(5, 2),
	"override_percentage" numeric(5, 2),
	"specialties" text,
	"licensed_states" text,
	"notes" text,
	"bank_name" text,
	"bank_account_type" text,
	"bank_account_number" text,
	"bank_routing_number" text,
	"bank_payment_method" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"client_id" integer,
	"created_by" integer,
	"user_id" integer,
	"type" text DEFAULT 'meeting',
	"task_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"company" text,
	"email" text NOT NULL,
	"phone" text,
	"sex" text,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"date_of_birth" date,
	"status" text DEFAULT 'active',
	"avatar_url" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"username" text,
	"password" text,
	"last_login" timestamp,
	"has_portal_access" boolean DEFAULT false,
	"assigned_agent_id" integer,
	"lead_id" integer
);
--> statement-breakpoint
CREATE TABLE "commissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"policy_number" text NOT NULL,
	"client_id" integer,
	"broker_id" integer,
	"amount" text NOT NULL,
	"status" text DEFAULT 'pending',
	"type" text NOT NULL,
	"payment_date" timestamp,
	"policy_start_date" timestamp,
	"policy_end_date" timestamp,
	"carrier" text,
	"policy_type" text,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "communication_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"subject" text,
	"content" text NOT NULL,
	"tags" text,
	"is_default" boolean DEFAULT false,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"client_id" integer,
	"type" text NOT NULL,
	"path" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"sex" text,
	"date_of_birth" date,
	"email" text,
	"phone_number" text,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"height" text,
	"weight" text,
	"smoker_status" text,
	"medical_conditions" text,
	"family_history" text,
	"income_range" text,
	"existing_coverage" text,
	"coverage_needs" text,
	"insurance_type_interest" text,
	"lead_source" text,
	"assigned_agent_id" integer,
	"status" text DEFAULT 'new',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"last_contacted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "marketing_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'draft',
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pipeline_opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"client_id" integer,
	"stage_id" integer,
	"value" numeric(10, 2),
	"probability" integer,
	"expected_close_date" timestamp,
	"assigned_to" integer,
	"notes" text,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pipeline_stages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"order" integer NOT NULL,
	"color" text,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "policies" (
	"id" serial PRIMARY KEY NOT NULL,
	"policy_number" text NOT NULL,
	"carrier" text NOT NULL,
	"policy_type" text NOT NULL,
	"status" text DEFAULT 'applied',
	"face_amount" numeric(15, 2) NOT NULL,
	"premium" numeric(10, 2) NOT NULL,
	"premium_frequency" text DEFAULT 'monthly',
	"application_date" date,
	"issue_date" date,
	"expiry_date" date,
	"client_id" integer,
	"lead_id" integer,
	"agent_id" integer NOT NULL,
	"add_riders" json,
	"notes" text,
	"documents" json,
	"cash_value" numeric(15, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"client_id" integer,
	"amount" text NOT NULL,
	"details" json,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"client_id" integer,
	"assigned_to" integer,
	"created_by" integer,
	"due_date" timestamp,
	"due_time" text,
	"priority" text DEFAULT 'medium',
	"status" text DEFAULT 'pending',
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"calendar_event_id" integer,
	"visible_to" integer[]
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"full_name" text,
	"email" text NOT NULL,
	"role" text DEFAULT 'agent',
	"avatar_url" text,
	"active" boolean DEFAULT true,
	"last_login" timestamp,
	"is_online" boolean DEFAULT false,
	"last_active" timestamp,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_assigned_agent_id_agents_id_fk" FOREIGN KEY ("assigned_agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_broker_id_users_id_fk" FOREIGN KEY ("broker_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_templates" ADD CONSTRAINT "communication_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_agent_id_agents_id_fk" FOREIGN KEY ("assigned_agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_opportunities" ADD CONSTRAINT "pipeline_opportunities_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_opportunities" ADD CONSTRAINT "pipeline_opportunities_stage_id_pipeline_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."pipeline_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_opportunities" ADD CONSTRAINT "pipeline_opportunities_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policies" ADD CONSTRAINT "policies_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policies" ADD CONSTRAINT "policies_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policies" ADD CONSTRAINT "policies_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;