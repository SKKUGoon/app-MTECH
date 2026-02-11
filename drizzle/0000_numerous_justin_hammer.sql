CREATE TABLE "atc_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "current_usages" (
	"id" serial PRIMARY KEY NOT NULL,
	"hospital_id" text NOT NULL,
	"drug_id" text NOT NULL,
	"quantity" numeric NOT NULL,
	"timestamp" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drugs" (
	"fda_class" text NOT NULL,
	"ingredient_code" text NOT NULL,
	"drug_code" text PRIMARY KEY NOT NULL,
	"drug_name" text NOT NULL,
	"manufactor" text NOT NULL,
	"atc_code" text NOT NULL,
	"atc_name" text NOT NULL,
	"atc_5" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hospitals" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"password" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supply_predictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"hospital_id" text NOT NULL,
	"drug_id" text NOT NULL,
	"quantity" numeric NOT NULL,
	"upper" numeric NOT NULL,
	"lower" numeric NOT NULL,
	"time" date NOT NULL,
	"model" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "current_usages" ADD CONSTRAINT "current_usages_hospital_id_hospitals_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "current_usages" ADD CONSTRAINT "current_usages_drug_id_atc_codes_id_fk" FOREIGN KEY ("drug_id") REFERENCES "public"."atc_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supply_predictions" ADD CONSTRAINT "supply_predictions_hospital_id_hospitals_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supply_predictions" ADD CONSTRAINT "supply_predictions_drug_id_atc_codes_id_fk" FOREIGN KEY ("drug_id") REFERENCES "public"."atc_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drugs" ADD CONSTRAINT "drugs_atc_5_atc_codes_id_fk" FOREIGN KEY ("atc_5") REFERENCES "public"."atc_codes"("id") ON DELETE no action ON UPDATE no action;