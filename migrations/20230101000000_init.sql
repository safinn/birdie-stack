-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS "otp" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "user_" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320) NOT NULL,
	"full_name" text,
  "default_organisation_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "organisation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone,
	"updated_by" uuid
);

CREATE TABLE IF NOT EXISTS "membership" (
	"user_id" uuid NOT NULL references "user_"("id"),
	"organisation_id" uuid NOT NULL references "organisation"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("user_id", "organisation_id")
);

CREATE TABLE IF NOT EXISTS "invitation" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organisation_id" uuid NOT NULL references "organisation"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid references "user_"("id") NOT NULL,
  "accepted_at" timestamp with time zone,
  "accepted_by" uuid references "user_"("id"),
  "cancelled_at" timestamp with time zone,
  "cancelled_by" uuid references "user_"("id")
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS "membership";
DROP TABLE IF EXISTS "invitation";
DROP TABLE IF EXISTS "organisation";
DROP TABLE IF EXISTS "user_";
DROP TABLE IF EXISTS "otp";
-- +goose StatementEnd
